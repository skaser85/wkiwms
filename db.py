"""
Simple sqlite3 wrapper
"""

from dataclasses import dataclass, field
from sqlite3 import connect, Cursor, Connection

@dataclass
class DB:
    """ Simple sqlite3 wrapper """
    db_file: str
    connection: Connection = field(init=False)
    cursor: Cursor = field(init=False)

    def __post_init__(self):
        self.connection = connect(self.db_file)
        self.cursor = self.connection.cursor()

    def fetch_one(self, sql: str, values: tuple = ()) -> Cursor:
        """ Fetch a single record from a table """
        return self.cursor.execute(sql, values).fetchone()

    def fetch_all(self, sql: str, values: tuple = ()) -> Cursor:
        """ Fetch multiple records from a table """
        return self.cursor.execute(sql, values).fetchall()

    def insert(self, sql: str, values: tuple[str] = ()) -> Cursor:
        """ Insert a record into a table """
        return self._execute_(sql, values)

    def update(self, sql: str, values: tuple[str] = ()) -> Cursor:
        """ Update a value on a record in a table """
        return self._execute_(sql, values)

    def delete(self, sql: str, values: tuple[str] = ()) -> Cursor:
        """ Delete a record from the table """
        return self._execute_(sql, values)

    def _execute_(self, sql: str, values: tuple[str] = ()) -> Cursor:
        """ Execute a sql query """
        self.cursor.execute(sql, values)
        self.connection.commit()
        return self.cursor

if __name__ == '__main__':
    ...
