import openai
# import spacy
# from spacy import displacy
# nlp = spacy.load('ja_ginza')

def bleat(mailbody):
#     propns = []
#     document = nlp(mailbody)
#     for ent in document.ents:
#         propns.append(ent.text)

#     return propns
    return ['ok']

def check(mailbody):
    # response = openai.ChatCompletion.create(
    #     model="gpt-3.5-turbo",
    #     messages=[
    #         {"role": "user", "content": "こんにちは"},
    #     ],
    # )
    # return response.choices[0]["message"]["content"].strip()
    return 'ok'

def generate_mailbody(conts):
    content = 
f"""# 命令書
- 次の内容を含むメールを作成してください。

# 内容
{f"- {cont}\n" for cont in conts}
"""
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": content},
        ],
    )
    return response.choices[0]["message"]["content"].strip()
    return 'ok'
