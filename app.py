from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
from bleat import bleat

app = Flask(__name__)
CORS(app)

@app.route("/bleat", methods=['POST'])
def post_bleat():
    json = request.get_json()
    mailbody = json["mailbody"]
    propns = bleat(mailbody)
    return make_response(jsonify({'propns': propns}))

if __name__ == "__main__":
    app.debug = True
    app.run(host='127.0.0.1', port=5000)