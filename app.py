from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
from bleat import get_sheep_bleat, check, generate_mailbody, generate_mailbody_content

app = Flask(__name__)
CORS(app)

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
    mailbody = generate_mailbody(conts)
    sheep_bleat = get_sheep_bleat()
    return make_response(jsonify({'mailbody': mailbody, 'sheep_bleat': sheep_bleat}))

@app.route('/generate_mailbody/debug', methods=['POST'])
def debug_post_generate_mailbody():
    json = request.get_json()
    conts = json["conts"]
    mailbody = generate_mailbody_content(conts)
    sheep_bleat = get_sheep_bleat()
    return make_response(jsonify({'mailbody': mailbody, 'sheep_bleat': sheep_bleat}))

if __name__ == "__main__":
    app.debug = True
    app.run(host='127.0.0.1', port=5000)