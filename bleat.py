from markupsafe import escape
from random import choice
import openai
import os
from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.environ['OPENAI_API_KEY']

sheep_bleats = [
    '成功しました', 'メ～', 'bleat!'
]

def get_sheep_bleat():
    return escape(choice(sheep_bleats))

def check(mailbody):
    # response = openai.ChatCompletion.create(
    #     model="gpt-3.5-turbo",
    #     messages=[
    #         {"role": "user", "content": "こんにちは"},
    #     ],
    # )
    # return response.choices[0]["message"]["content"].strip()
    return 'ok'

def generate_mailbody_content(conts):
    content = """# 命令書
- 以下の内容を含むメールのテンプレートを作成してください。
- プレースホルダは角括弧で囲んでください。
- 件名は<title></title>で、本文は<body></body>で囲んでください。

# 内容
""" + "".join(f"- {cont}\n" for cont in conts)
    return content # - div要素の中にほかのdiv要素が入っても構いません。

def check_content(conts, index):
    content = f"""# 命令書
- 以下の内容を説明する部分を<div id="{index}"></div>で囲むように修正してください。

# 内容
{conts[index]}
"""
    return content

def generate_mailbody(conts):
    if openai.api_key == "[ここにOpenAIのAPIキー]":
        return "ok"
        
    content = generate_mailbody_content(conts)
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": content},
        ],
    )
    return response.choices[0]["message"]["content"].strip()
