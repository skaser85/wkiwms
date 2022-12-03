"""
The episode module is really cool.
"""

from __future__ import annotations
from typing import List
from dataclasses import dataclass, field, asdict
from datetime import date
from pprint import pprint
from dbhandler import DBHandler

DB_PATH = 'wkiwms.db'

def get_guest(guest_name: str) -> dict:
    """ Gets the guest data """
    with DBHandler(DB_PATH) as db:
        db_guest = db.fetch_one('SELECT * FROM guest WHERE name=?', (guest_name,))
        return (Guest(db_guest[0], db_guest[1]).to_dict())

def insert_guest(guest_name: str) -> dict:
    """ Inserts a new guest """
    with DBHandler(DB_PATH) as db:
        db_guest = db.insert('INSERT INTO guest (name) values (?)', (guest_name,))
        guest = db.fetch_one('SELECT * FROM guest WHERE id=?', (db_guest.lastrowid,))
        return (Guest(guest[0], guest[1]).to_dict())
    
def add_guest_to_episode(episode_id: int, guest_id: int):
    """ Adds a guest to the episode """
    with DBHandler(DB_PATH) as db:
        db.insert('INSERT INTO episode_guest (episode_id, guest_id) values (?, ?)', (episode_id, guest_id))
    
def get_guests_for_episode(episode_id: int) -> List[dict]:
    """ Gets the guests for the episode """
    with DBHandler(DB_PATH) as db:
        ep_guests = db.fetch_all('SELECT * FROM episode_guest WHERE episode_id=?', (episode_id,))
        guests = []
        for eg in ep_guests:
            guest_db = db.fetch_one('SELECT * FROM guest WHERE id=?', (eg[1],))
            guests.append(Guest(guest_db[0], guest_db[1]))
        return [g.to_dict() for g in guests]

def get_next_episode() -> int:
    """ Get the next available episode number. """
    with DBHandler(DB_PATH) as db:
        db_episode = db.fetch_one('SELECT * FROM episode ORDER BY number DESC LIMIT 1')
        ep_no = int(db_episode[0]) + 1
        ep_insert = db.insert('INSERT INTO episode (number) values (?)', (ep_no,))
        return ep_insert.lastrowid

def get_guests() -> List[dict]:
    """ Gets a list of the guests in the db. """
    with DBHandler(DB_PATH) as db:
        # get episodes
        db_guests = db.fetch_all('SELECT * FROM guest')
        guests = [Guest(g[0], g[1]) for g in db_guests]
        return sorted([g.to_dict() for g in guests], key=lambda g: g['name'])

def delete_guests_on_episode(episode_id: int) -> None:
    """ Deletes all guests from an episode"""
    with DBHandler(DB_PATH) as db:
        db.delete('DELETE FROM episode_guest WHERE episode_id=?', (episode_id,))

def delete_guest_on_episode(episode_id: int, guest_id: int) -> None:
    """ Deletes a single guest from an episode """
    with DBHandler(DB_PATH) as db:
        db.delete('DELETE FROM episode_guest WHERE episode_id=? AND guest_id=?', (episode_id,guest_id))
        g = db.fetch_all('SELECT * FROM episode_guest WHERE episode_id=?', (episode_id,))
        for guest in g:
            print(guest)

def add_record_date(episode_id: int, date_str: str) -> str:
    """ Adds the Record Date to the episode """
    with DBHandler(DB_PATH) as db:
        db.update('UPDATE episode SET record_date=? WHERE number=?', (date_str, episode_id))
        return date_str
    
def get_question_categories() -> list[dict]:
    """ Gets the question categories """
    with DBHandler(DB_PATH) as db:
        db_cats = db.fetch_all('SELECT * FROM question_category')
        return [{'id': c[0], 'category': c[1]} for c in db_cats]

def get_default_episode_data() -> dict:
    """ Gets the data for the adddEpisodeData webpage """
    return {
        'guests': get_guests(),
        'categories': get_question_categories(),
        'types': get_answer_types()
    }

def get_record_date(episode_id: int) -> str:
    """ Gets the record date for the episode """
    with DBHandler(DB_PATH) as db:
        db_date = db.fetch_one('SELECT record_date FROM episode WHERE number=?', (episode_id,))
        d = str(db_date[0])
        if '-' in d:
            return d
        d = f'{d[:4]}-{d[4:6]}-{d[6:]}'
        return d

def get_episode_data(episode_id: int) -> dict:
    """ Gets the data for the edit episode webpage """
    return {
        'number': episode_id,
        'record_date': get_record_date(episode_id),
        'guests': get_guests(),
        'questions': get_questions_for_episode(episode_id),
        'categories': get_question_categories(),
        'types': get_answer_types(),
        'guestsOnEpisode': get_guests_for_episode(episode_id),
    }

def get_answer_types() -> list[dict]:
    """ Gets a list of the answer types """
    with DBHandler(DB_PATH) as db:
        db_types = db.fetch_all('SELECT * FROM answer_type')
        return [{'id': t[0], 'type': t[1]} for t in db_types]
    
def add_answer_to_question(question_id: int, answer: str, type_id: int, guest_id: int, link: str, fun_fact: str) -> None:
    """ Adds an answer to the question """
    with DBHandler(DB_PATH) as db:
        db_answer = db.insert('INSERT INTO answer (question_id, answer, type_id, guest_id, link, fun_fact) VALUES (?,?,?,?,?,?)', (question_id, answer, type_id, guest_id, link, fun_fact))

def get_answers_for_question(question_id: int) -> list[dict]:
    """ Gets answers for question """
    with DBHandler(DB_PATH) as db:
        db_answers = db.fetch_all('SELECT * FROM answer WHERE question_id=?', (question_id,))
        answers = []
        for a in db_answers:
            answer_type = '' if a[3] == '' else get_answer_type_from_id(a[3])
            guest_name = '' if a[4] == '' else get_guest_name_from_id(a[4])
            answer = Answer(a[0], a[2], answer_type, guest_name, a[5], a[6])
            answers.append(answer)
        return [a.to_dict() for a in answers]

def create_question(question: str, category_id: int, contributor: str, location: str) -> tuple:
    """ Create the question """
    with DBHandler(DB_PATH) as db:
        db_question = db.insert('INSERT INTO question (question, category_id, contributor_name, contributor_location) values (?, ?, ?, ?)', (question, category_id, contributor, location))
        return db.fetch_one('SELECT * FROM question where id=?', (db_question.lastrowid,))
        
def add_question_to_episode(episode_id: int, question_id: int) -> None:
    """ Adds a question to the episode """
    with DBHandler(DB_PATH) as db:
        db_ep_question = db.insert('INSERT INTO episode_question (episode_id, question_id) values (?, ?)', (episode_id, question_id))

def get_questions_for_episode(episode_id: int) -> list[dict]:
    """ Gets the questions for the episode """
    with DBHandler(DB_PATH) as db:
        db_questions = db.fetch_all('SELECT * FROM episode_question WHERE episode_id=?', (episode_id,))
        questions = []
        for question in db_questions:
            q = db.fetch_one('SELECT * FROM question WHERE id=?', (question[1],))
            category = get_question_category_from_id(q[3])
            questions.append(Question(q[0], q[4], category, q[1], q[2]))
        return [q.to_dict() for q in questions]
    
def get_question_category_from_id(category_id: int) -> str:
    """ Gets the category type text based on the category id"""
    with DBHandler(DB_PATH) as db:
        db_cat = db.fetch_one('SELECT * FROM question_category WHERE id=?', (category_id,))
        return db_cat[1]
    
def get_answer_type_from_id(answer_type_id: int) -> str:
    """ Gets the answer type text based on the answer type id"""
    with DBHandler(DB_PATH) as db:
        db_ans_type = db.fetch_one('SELECT * FROM answer_type WHERE id=?', (answer_type_id,))
        return db_ans_type[1]
    
def get_guest_name_from_id(guest_id: int) -> str:
    """ Gets the guest name from the guest id """
    if guest_id is None:
        return ''
    with DBHandler(DB_PATH) as db:
        db_guest = db.fetch_one('SELECT * FROM guest WHERE id=?', (guest_id,))
        return db_guest[1]
    
def delete_question_from_episode(episode_id: int, question_id: int) -> None:
    """ Deletes the question from the episode """
    with DBHandler(DB_PATH) as db:
        delete_answers_from_question(question_id)
        db.delete('DELETE FROM episode_question WHERE episode_id=? AND question_id=?', (episode_id, question_id))

def delete_questions_from_episode(episode_id: int) -> None:
    """ Deletes all questions from the episode """
    questions = get_questions_for_episode(episode_id)
    for question in questions:
        delete_answers_from_question(question[0])
    with DBHandler(DB_PATH) as db:
        db.delete('DELETE FROM episode_question WHERE episode_id=?', (episode_id,))

def delete_answer_from_question(question_id: int, answer_id: int) -> None:
    """ Deletes an answer from a question """
    with DBHandler(DB_PATH) as db:
        db.delete('DELETE FROM answer WHERE question_id=? AND id=?', (question_id, answer_id))

def delete_answers_from_question(question_id: int) -> None:
    """ Deletes all answers from a question """
    with DBHandler(DB_PATH) as db:
        db.delete('DELETE FROM answer WHERE question_id=?', (question_id,))

def get_episodes() -> List[dict]:
    """ Gets the episodes from the db. """
    # episodes  = [
    #     {
    #         number,
    #         record_date,
    #         guests: [
    #             {
    #                 id,
    #                 name
    #             }
    #         ],
    #         questions: [
    #             {
    #                 number,
    #                 question,
    #                 category,
    #                 contributor,
    #                 location,
    #                 answers: [
    #                     {
    #                         id,
    #                         answer,
    #                         type,
    #                         guest,
    #                         link,
    #                         fun_fact
    #                     }
    #                 ]
    #             }
    #         ]
    #     }
    # ]
    with DBHandler(DB_PATH) as db:
        # get episodes
        db_episodes = db.fetch_all('SELECT * FROM episode')
        episodes = []
        for episode in db_episodes:
            e = Episode(episode[0], get_record_date(episode[0]))
            # get guests for episode
            db_ep_guests = db.fetch_all('SELECT * FROM episode_guest WHERE episode_id=?', (episode[0],))
            guests = []
            for eg in db_ep_guests:
                # get guest details
                guest = db.fetch_one('SELECT * FROM guest WHERE id=?', (eg[1],))
                guests.append(Guest(guest[0], guest[1]))
            e.guests = guests
            # get questions for episode
            db_ep_questions = db.fetch_all('SELECT * FROM episode_question WHERE episode_id=?', (episode[0],))
            questions = []
            for eq in db_ep_questions:
                # get question details
                question = db.fetch_one('SELECT * FROM question WHERE id=?', (eq[1],))
                # get question category
                category = get_question_category_from_id(question[3])
                # create Question object
                q = Question(question[0], question[4], category, question[1], question[2])
                # get answers
                db_answers = db.fetch_all('SELECT * FROM answer WHERE question_id=?', (q.number,))
                for dba in db_answers:
                    answer_type = get_answer_type_from_id(dba[3])
                    guest_name = ''
                    if dba[4] is not None and dba[4] != '':
                        guest_name = get_guest_name_from_id(dba[4])
                    answer = Answer(dba[0], dba[2], answer_type, guest_name, dba[5], dba[6])
                    q.answers.append(answer)
                # add question to questions
                questions.append(q)
            # add questions to episode
            e.questions = questions
            # add episode to episodes
            episodes.append(e)
        # create list of dict episodes
        return [e.to_dict() for e in episodes]

@dataclass
class Answer:
    """ Answer """
    id: int
    answer: str
    type: str
    guest: str = ''
    link: str = ''
    fun_fact: str = ''

    def to_dict(self) -> dict:
        """ Returns this Answer object as a dict """
        return asdict(self)

@dataclass
class Question:
    """ Question """
    number: int
    question: str
    category: str
    contributor: str
    location: str
    answers: List[Answer] = field(default_factory=list)

    def to_dict(self) -> dict:
        """ Returns this Question object as a dict """
        return asdict(self)

@dataclass
class Guest:
    """ Guest """
    id: int
    name: str

    def to_dict(self) -> dict:
        """ Returns this Guest object as a dict """
        return asdict(self)

@dataclass
class Episode:
    """ Episode """
    number: int
    record_date: date
    guests: List[Guest] = field(default_factory=list)
    questions: List[Question] = field(default_factory=list)

    def to_dict(self) -> dict:
        """ Returns this Episode object as a dict """
        return asdict(self)

if __name__ == '__main__':
    # add_record_date(3, '20221122')
    # pprint(get_episodes())
    # delete_guest_on_episode(3, 2)
    # pprint(get_question_categories())
    # add_question_to_episode(3, 8)
    # print(get_questions_for_episode(3))
    print(get_record_date(3))
