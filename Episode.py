from __future__ import annotations
from typing import List, Tuple
from dataclasses import dataclass, field, asdict
from datetime import date
from bs4 import Tag
from dbhandler import DBHandler

DB_PATH = 'wkiwms.db'

def get_episodes() -> List[Episode]:
    with DBHandler(DB_PATH) as db:
        db_episodes = db.fetch_all('SELECT * FROM episode')
        episodes = []
        for episode in db_episodes:
            e = Episode(episode[0], episode[1])
            db_ep_guests = db.fetch_all('SELECT * FROM episode_guest WHERE episode=?', (episode[0],))
            guests = []
            for eg in db_ep_guests:
                guest = db.fetch_one('SELECT * FROM guest WHERE id=?', (eg[1],))
                guests.append(Guest(guest[0], guest[1]))
            e.guests = guests
            episodes.append(e)
        return [e.to_dict() for e in episodes]

def recipe_exists(url: str) -> bool:
    with DBHandler(DB_PATH) as db:
        recipe = db.fetch_one(f'SELECT * FROM recipe WHERE url=?', (url,))
        print(recipe)
        return False if recipe is None else True

def add_recipe(recipe: Recipe):
    with DBHandler(DB_PATH) as db:
        c = db.insert(f'INSERT INTO recipe (id,name,url,description) VALUES (?,?,?,?)', (None, recipe.name, recipe.url, recipe.description))
        r_id = c.lastrowid
        for ing in recipe.ingredients:
            db.insert(f'INSERT INTO ingredient (recipe_id, name, amount, unit) VALUES (?,?,?,?)', (r_id, ing.name, ing.amount, ing.unit))
        for inst in recipe.instructions:
            db.insert(f'INSERT INTO instruction (recipe_id, sequence, text) VALUES (?,?,?)', (r_id, inst.order, inst.instruction))

@dataclass
class Guest:
    id: int
    name: str

@dataclass
class Episode:
    number: int
    record_date: date
    guests: List[Guest] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)

if __name__ == '__main__':
    print(get_episodes())