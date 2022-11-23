"""
This is the server file that serves the webpages and talks to the database.
"""

from flask import Flask, render_template, request
from episode import get_episodes, get_guests, get_next_episode, get_guest, insert_guest, add_guest_to_episode, get_guests_for_episode, add_record_date

app = Flask(__name__)

@app.route('/')
def index():
    """ serves the home page """
    return render_template('index.html', episodes=get_episodes())

@app.route('/addEpisodeData')
def addEpisodeData():
    """ serves the addEpisodeData page"""
    return render_template('addEpisodeData.html', guestData=get_guests())

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
    print(request.args)
    add_guest_to_episode(int(request.args.get('episodeid')), int(request.args.get('guestid')))
    return {'guests': get_guests(), 'guestsOnEpisode': get_guests_for_episode(int(request.args.get('episodeid')))}

@app.route('/add-record-date')
def add_record_date_data():
    """ adds the record date to episode """
    return {'date': add_record_date(request.args.get('episodeid'), request.args.get('date'))}

if __name__ == '__main__':
     app.run(host='0.0.0.0', port=8008, debug=True)
