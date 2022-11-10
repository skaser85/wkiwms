from flask import Flask, render_template, request
import requests
from bs4 import BeautifulSoup
from Episode import get_episodes

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route('/get-episodes')
def get_episodes_():
    return {'error': '', 'episodes': get_episodes()}

if __name__ == '__main__':
     app.run(host='0.0.0.0', port=8008, debug=False)