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

def get_answer_types() -> list[dict]:
    """ Gets a list of the answer types """
    with DBHandler(DB_PATH) as db:
        db_types = db.fetch_all('SELECT * FROM answer_type')
        return [{'id': t[0], 'type': t[1]} for t in db_types]

def create_question(question: str, category_id: int, contributor: str, location: str) -> tuple:
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
    with DBHandler(DB_PATH) as db:
        db_cat = db.fetch_one('SELECT * FROM question_category WHERE id=?', (category_id,))
        category = db_cat[1]
        return category
    
def delete_question_from_episode(episode_id: int, question_id: int) -> None:
    with DBHandler(DB_PATH) as db:
        db.delete('DELETE FROM episode_question WHERE episode_id=? AND question_id=?', (episode_id, question_id))

def delete_questions_from_episode(episode_id: int) -> None:
    with DBHandler(DB_PATH) as db:
        db.delete('DELETE FROM episode_question WHERE episode_id=?', (episode_id,))

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
            e = Episode(episode[0], episode[1])
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
                    db_ans_type = db.fetch_one('SELECT * FROM answer_type WHERE id=?', (dba[3],))
                    answer_type = db_ans_type[1]
                    guest_name = ''
                    if dba[4] is not None:
                        db_guest = db.fetch_one('SELECT * FROM guest WHERE id=?', (dba[4],))
                        guest_name = db_guest[1]
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
    add_question_to_episode(3, 8)
    print(get_questions_for_episode(3))
