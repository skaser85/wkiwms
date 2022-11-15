"""
This is the server file that serves the webpages and talks to the database.
"""

from flask import Flask, render_template
from episode import get_episodes

app = Flask(__name__)

@app.route("/")
def index():
    """ serves the home page """
    return render_template('index.html', episodes=get_episodes())

if __name__ == '__main__':
     app.run(host='0.0.0.0', port=8008, debug=True)
