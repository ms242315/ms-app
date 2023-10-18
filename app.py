from flask import Flask, make_response, request, jsonify
from markupsafe import escape
from flask_cors import CORS
from bleat import bleat, check, generate_mailbody
from random import choice
import os
import openai
from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.environ['OPENAI_API_KEY']

app = Flask(__name__)
CORS(app)

sheep_bleats = [
    '成功しました', 'メ～', 'bleat!'
]

@app.route("/bleat", methods=['POST'])
def post_bleat():
    json = request.get_json()
    mailbody = json["mailbody"]
    propns = bleat(mailbody)
    sheep_bleat = choice(sheep_bleats)
    return make_response(jsonify({'propns': propns, 'sheep_bleat': sheep_bleat}))

@app.route('/check', methods=['POST'])
def post_check():
    json = request.get_json()
    mailbody = json["mailbody"]
    result = check(mailbody)
    return make_response(jsonify({'result': result}))

@app.route('/generate_mailbody', methods=['POST'])
def post_generate_mailbody():
    json = request.get_json()
    conts = json["conts"]
    mailbody = escape(generate_mailbody(conts))
    sheep_bleat = escape(choice(sheep_bleats))
    return make_response(jsonify({'mailbody': mailbody, 'sheep_bleat': sheep_bleat}))

if __name__ == "__main__":
    app.debug = True
    app.run(host='127.0.0.1', port=5000)