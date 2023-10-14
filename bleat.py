import spacy
from spacy import displacy
nlp = spacy.load('ja_ginza')

def bleat(mailbody):
    propns = []
    document = nlp(mailbody)
    for ent in document.ents:
        propns.append(ent.text)

    return propns
