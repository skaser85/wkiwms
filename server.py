"""
This is the server file that serves the webpages and talks to the database.
"""

from flask import Flask, render_template, request
from flask_cors import CORS
from episode import get_episodes, get_guests, get_next_episode, get_guest, insert_guest, add_guest_to_episode, get_guests_for_episode, add_record_date, delete_guests_on_episode, delete_guest_on_episode

app = Flask(__name__)
CORS(app)

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

@app.route('/get-guest')
def get_guest_data():
    """ gets guest data """
    return {'guest': get_guest(request.args.get('guest'))}

@app.route('/insert-guest')
def insert_guest_data():
    """ inserts guest data """
    return {'guest': insert_guest(request.args.get('guest'))}

@app.route('/add-guest-to-episode')
def add_guest_to_episode_data():
    """ adds guest to episode """
    add_guest_to_episode(int(request.args.get('episodeid')), int(request.args.get('guestid')))
    return {'guests': get_guests(), 'guestsOnEpisode': get_guests_for_episode(int(request.args.get('episodeid')))}

@app.route('/add-record-date')
def add_record_date_data():
    """ adds the record date to episode """
    return {'date': add_record_date(request.args.get('episodeid'), request.args.get('date'))}

@app.route('/delete-guests-on-episode')
def delete_guests_on_episode_():
    """ deletes all guests from episode """
    delete_guests_on_episode(request.args.get('episodeid'))
    return {'guests': get_guests(), 'guestsOnEpisode': {}}

@app.route('/delete-guest-from-episode')
def delete_guest_on_episode_():
    """ deletes a single guest from episode """
    delete_guest_on_episode(request.args.get('episodeid'), request.args.get('guestid'))
    return {'guests': get_guests(), 'guestsOnEpisode': get_guests_for_episode(request.args.get('episodeid'))}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8008, debug=True)
