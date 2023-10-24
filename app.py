from flask import Flask, render_template, make_response, request, jsonify
from markupsafe import escape
from flask_cors import CORS
from bleat import get_sheep_bleat, generate_mail, generate_mail_content, highlight, highlight_content

app = Flask(__name__, static_folder='./mailer-sheep/build/static', template_folder='./mailer-sheep/build')
CORS(app)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate_mail", methods=["POST"])
def post_generate_mail():
    json = request.get_json()
    conts = json["conts"]
    mailtitle, mailbody = generate_mail(conts)
    sheep_bleat = escape(get_sheep_bleat())
    return make_response(jsonify({"mailtitle": mailtitle, "mailbody": mailbody, "sheep_bleat": sheep_bleat}))

@app.route("/generate_mail/debug", methods=["POST"])
def debug_post_generate_mail():
    json = request.get_json()
    conts = json["conts"]
    content = generate_mail_content(conts)
    sheep_bleat = escape(get_sheep_bleat())
    return make_response(jsonify({"mailtitle": "Debug Mode", "mailbody": content, "sheep_bleat": sheep_bleat}))

@app.route("/highlight", methods=["POST"])
def post_highlight():
    json = request.get_json()
    mailbody = json["mailbody"]
    cont = json["cont"]
    p = escape(highlight(mailbody, cont))
    return make_response(jsonify({"p": p}))

#@app.route("/highlight/debug", methods=["POST"])
def debug_post_highlight():
    json = request.get_json()
    mailbody = json["mailbody"]
    cont = json["cont"]
    p = escape(highlight_content(mailbody, cont))
    print(p)
    return make_response(jsonify({"p": "debug"}))

if __name__ == "__main__":
    app.debug = True
    app.run(host="127.0.0.1", port=5000)
