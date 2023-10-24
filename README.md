# Mailer Sheep

# 準備

Create .env
```
OPENAI_API_KEY=[ここにOpenAIのAPIキー]
```

pip:
```
pip install flask
pip install flask-cors
pip install python-dotenv
pip install openai
```

# 実行

このREADME.mdがあるディレクトリで以下のコマンドを実行してください。
```
py app.run
```

# デバッグモード

ページ表示中、ブラウザのURLに `?debug=1` を追加することでデバッグモードになります。

デバッグモードではメールテンプレート生成に OpenAI API を使用せず、代わりにプロンプト（ChatGPTへの命令文）をそのまま表示します。

表示されたプロンプトをコピーして ChatGPT へ送信し、その返答をプロンプトが表示されている欄へコピー&ペーストすることで、通常とほぼ同じ動作が可能です。
（ただし、メール内容確認機能は使用できません）
