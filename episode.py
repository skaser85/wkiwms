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

def get_next_episode() -> int:
    """ Get the next available episode number. """
    with DBHandler(DB_PATH) as db:
        db_episode = db.fetch_one('SELECT * FROM episode ORDER BY number DESC LIMIT 1')
        return int(db_episode[0]) + 1

def get_guests() -> List[dict]:
    """ Gets a list of the guests in the db. """
    with DBHandler(DB_PATH) as db:
        # get episodes
        db_guests = db.fetch_all('SELECT * FROM guest')
        guests = [Guest(g[0], g[1]) for g in db_guests]
        return sorted([g.to_dict() for g in guests], key=lambda g: g['name'])


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
            db_ep_guests = db.fetch_all('SELECT * FROM episode_guest WHERE episode=?', (episode[0],))
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
                category_id = question[3]
                db_cat = db.fetch_one('SELECT * FROM question_category WHERE id=?', (category_id,))
                category = db_cat[1]
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
    print(get_next_episode())
