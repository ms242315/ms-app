from flask import Flask, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/bleat", methods=['POST'])
def bleat():
    return "bleat"

if __name__ == "__main__":
    app.debug = True
    app.run(host='127.0.0.1', port=5000)