"""
This is the server file that serves the webpages and talks to the database.
"""

from flask import Flask, render_template, request
from flask_cors import CORS
# from flask_talisman import Talisman
from episode import get_episodes, get_guests, get_next_episode, get_guest, insert_guest, add_guest_to_episode,\
                    get_guests_for_episode, add_record_date, delete_guests_on_episode, delete_guest_on_episode,\
                    get_default_episode_data, add_question_to_episode, create_question, get_questions_for_episode,\
                    delete_question_from_episode, delete_questions_from_episode, add_answer_to_question, get_answers_for_question,\
                    delete_answer_from_question, delete_answers_from_question

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    """ serves the home page """
    return render_template('index.html', episodes=get_episodes())

@app.route('/addEpisodeData')
def addEpisodeData():
    """ serves the addEpisodeData page"""
    return render_template('addEpisodeData.html', data=get_default_episode_data())

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
    return {'guests': get_guests(), 'guestsOnEpisode': []}

@app.route('/delete-guest-from-episode')
def delete_guest_on_episode_():
    """ deletes a single guest from episode """
    delete_guest_on_episode(request.args.get('episodeid'), request.args.get('guestid'))
    return {'guests': get_guests(), 'guestsOnEpisode': get_guests_for_episode(request.args.get('episodeid'))}

@app.route('/add-question-to-episode')
def add_question_to_episode_():
    """ adds a question to an episode """
    episode_id = request.args.get('episodeid')
    question = request.args.get('question')
    category_id = request.args.get('categoryid')
    contributor = request.args.get('contributor')
    location = request.args.get('location')
    question_db = create_question(question, category_id, contributor, location)
    add_question_to_episode(episode_id, question_db[0])
    return {'questions': get_questions_for_episode(episode_id)}

@app.route('/delete-question-from-episode')
def delete_question_from_episode_():
    """ deletes a question from an episode """
    delete_question_from_episode(request.args.get('episodeid'), request.args.get('questionid'))
    return {'questions': get_questions_for_episode(request.args.get('episodeid'))}

@app.route('/delete-questions-from-episode')
def delete_questions_from_episode_():
    """ deletes all questions from an episode """
    delete_questions_from_episode(request.args.get('episodeid'))
    return {'questions': []}

@app.route('/add-answer-to-question')
def add_answer_to_question_():
    """ adds an answer to question """
    question_id = request.args.get('questionid')
    answer = request.args.get('answer')
    type_id = request.args.get('typeid')
    guest_id = request.args.get('guestid')
    link = request.args.get('link')
    fun_fact = request.args.get('funfact')
    add_answer_to_question(question_id, answer, type_id, guest_id, link, fun_fact)
    return {'answers': get_answers_for_question(question_id)}

@app.route('/delete-answer-from-question')
def delete_answer_from_question_():
    """ deletes an answer from the question """
    delete_answer_from_question(request.args.get('questionid'), request.args.get('answerid'))
    return {'answers': get_answers_for_question(request.args.get('questionid'))}

@app.route('/delete-answers-from-question')
def delete_answers_from_question_():
    """ deletes all answers from the qustion """
    delete_answers_from_question(request.args.get('questionid'))
    return {'answers': []}

@app.route('/get-questions-for-episode')
def get_questions_for_episode_():
    """ gets questions for the episodes """
    return {'questions': get_questions_for_episode(request.args.get('episodeid'))}

@app.route('/get-guests-for-episode')
def get_guests_for_episode_():
    """ gets the guests for the episode """
    return {'guests': get_guests_for_episode(request.args.get('episodeid'))}

@app.route('/get-answers-for-question')
def get_answers_for_questions_():
    """ gets the answers for the question """
    return {'answers': get_answers_for_question(request.args.get('questionid'))}

# Talisman(app, content_security_policy=None)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8008, debug=True)
