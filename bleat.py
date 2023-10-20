import re
from random import choice
import openai
import os
from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.environ["OPENAI_API_KEY"]

sheep_bleats = [
    "成功しました", "メ～", "bleat!"
]

def get_sheep_bleat():
    return choice(sheep_bleats)

def get_element(doc, element):
    title_atch = re.search(fr"<{element}>(.*?)</{element}>", doc)
    if title_atch:
        return title_atch.group(1)
    else:
        return None



def generate_mail_content(conts):
    content = """# 命令書
- 以下の内容を含むメールのテンプレートを作成してください。
- プレースホルダは角括弧で囲んでください。
- 件名は<title></title>で、本文は<body></body>で囲んでください。

# 内容
""" + "".join(f"- {cont['c']}\n" for cont in conts)
    return content

def generate_mail(conts):
    if openai.api_key == "[ここにOpenAIのAPIキー]":
        return ("Error", "OpenAI APIキーが設定されていません")
        
    content = generate_mail_content(conts)
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            { "role": "user", "content": content },
        ],
    )
    doc = response["choices"][0]["message"]["content"]
    title = get_element(doc, "title")
    body = get_element(doc, "body")
    return (title, body)



def highlight_content(mailbody, cont):
    content = f"""# 命令書
- 以下の本文から「{cont['c']}」を表す部分を抜き出してください。
- 抜き出した部分は<p></p>で囲んでください。

# 本文
{mailbody}
"""
    return content

def highlight(mailbody, cont):
    if openai.api_key == "[ここにOpenAIのAPIキー]":
        return "OpenAI APIキーが設定されていません"
        
    content = highlight_content(mailbody, cont)
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            { "role": "user", "content": content },
        ],
    )
    doc = response["choices"][0]["message"]["content"]
    p = get_element(doc, "p")
    return p
