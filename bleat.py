import spacy
from spacy import displacy
import openai
nlp = spacy.load('ja_ginza')

def bleat(mailbody):
    propns = []
    document = nlp(mailbody)
    for ent in document.ents:
        propns.append(ent.text)

    return propns

def check(mailbody):
    # response = openai.ChatCompletion.create(
    #     model="gpt-3.5-turbo",
    #     messages=[
    #         {"role": "user", "content": "こんにちは"},
    #     ],
    # )
    # return response.choices[0]["message"]["content"].strip()
    return 'ok'