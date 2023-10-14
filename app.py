from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
from bleat import bleat
from random import choice

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

if __name__ == "__main__":
    app.debug = True
    app.run(host='127.0.0.1', port=5000)