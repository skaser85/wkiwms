"""
This is the server file that serves the webpages and talks to the database.
"""

from flask import Flask, render_template
from episode import get_episodes, get_guests, get_next_episode

app = Flask(__name__)

@app.route('/')
def index():
    """ serves the home page """
    return render_template('index.html', episodes=get_episodes())

@app.route('/addEpisodeData')
def addEpisodeData():
    """ serves the addEpisodeData page"""
    return render_template('addEpisodeData.html', guests=get_guests())

@app.route('/get-next-episode-number')
def get_next_episode_number():
    """ gets the next episode number """
    return {'next_episode_no': get_next_episode()}

if __name__ == '__main__':
     app.run(host='0.0.0.0', port=8008, debug=True)
