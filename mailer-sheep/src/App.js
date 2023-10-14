import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, FormControl } from 'react-bootstrap'

import { useForm, useFieldArray } from "react-hook-form"

import Axios from 'axios';

function App() {
  const { register, handleSubmit, setValue, getValues, control } = useForm({
    defaultValues: {
      repl: [
        {
            from: '',
            to: ''
        }
      ],
      chec: [
        {
            body: ''
        }
      ],
    }
  });
  const { fields: repl_fields, append: repl_append, remove: repl_remove } = useFieldArray({
    control,
    name: 'repl'
  });
  const { fields: chec_fields, append: chec_append, remove: chec_remove } = useFieldArray({
    control,
    name: 'chec'
  });

  const bleat = () => {
    const mailBody = getValues('body');
    Axios.post('http://127.0.0.1:5000/bleat', {
      post_text: mailBody
    }).then((result) => {
      console.log(result);
    });
  };
  
  const onSubmit = (data) => {
    const mailBody = getMailBody(data);
    const checBody = getChecBody(data);

    // let result = "```\n" + mailBody + "\n```\n";
    // result += "以下の項目のうち、上記の文章に含まれていない項目を挙げてください。\n";
    // result += checBody;

    let result = "#命令書\n";
    result += "- 次のメール本文にチェックリストの項目が漏れなく記述されているか教えてください。\n\n";
    result += "#メール本文\n" + mailBody + "\n";
    result += "#チェックリスト\n" + checBody;

    setValue('result', result);

    copyToClipboard(result)
  };

  const onAPISubmit = async (data) => {
    const mailBody = getMailBody(data);
    const checBody = getChecBody(data);

    // let result = "```\n" + mailBody + "\n```\n";
    // result += "以下の項目のうち、上記の文章に含まれていない項目を挙げてください。\n";
    // result += checBody;

    let result = "#命令書\n";
    result += "- 次のメール本文にチェックリストの項目が漏れなく記述されているか教えてください。\n\n";
    result += "#メール本文\n" + mailBody + "\n";
    result += "#チェックリスト\n" + checBody;
    
    setValue('apiresult', getValues('apikey'));

    // const configuration = new Configuration({
    //   apiKey: getValues('apikey'),
    // });
    // const openai = new OpenAIApi(configuration);
    // const completion = await openai.createChatCompletion({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     {
    //       role: "user",
    //       content: result,
    //     },
    //   ],
    // });
    // const answer = completion.data;
    // const errors = answer.split(' ');

    // let divresult = "チェック結果：";
    // let checs = getValues('chec');
    // for (let i = 0; i < checs.length; i++) {
    //   let chec = checs[i];
    //   if (errors.contains(chec)) {
    //     // エラー
    //   } else {
    //     // 正常
    //   }
    // }
  };

  const getMailBody = (data) => {
    let mailBody = getValues('body');
    let repls = getValues('repl');
    for (let i = 0; i < repls.length; i++) {
      let pair = repls[i];
      mailBody = mailBody.split(pair.from).join(pair.to);
    }
    mailBody = mailBody + "\n";
    return mailBody;
  }

  const getChecBody = (data) => {
    let checBody = "";
    let checs = getValues('chec');
    for (let i = 0; i < checs.length; i++) {
      let chec = checs[i];
      checBody += "- " + chec.body + "\n";
    }
    return checBody;
  }

  const copyToClipboard = async (text) => {
    await global.navigator.clipboard.writeText(text);
  };

  return (
    <div className="container-fluid">
      <h1>ChatGPTにメールの記入漏れを判断させる</h1>

      <p><label>
        本文：<br />
        <FormControl as="textarea" rows={10} cols={100} {...register('body')} />
      </label></p>
      <Button onClick={() => bleat()}>ブリートする</Button>

      置き換え：<br />
      <table><tbody>
        {repl_fields.map((field, index) => (
          <tr key={field.id}>
            <td><FormControl as="textarea" cols={40} {...register(`repl.${index}.from`)} /></td>
            <td>=&gt;</td>
            <td><FormControl as="textarea" cols={40} {...register(`repl.${index}.to`)} /></td>
            <td><Button onClick={() => repl_remove(index)}>削除</Button></td>
          </tr>
        ))}
      </tbody></table>
      <Button onClick={() => repl_append({from: '', key: ''})}>
        置き換えを追加
      </Button>
      
      チェックリスト：<br />
      <table><tbody>
        {chec_fields.map((field, index) => (
          <tr key={field.id}>
            <td><FormControl type="text" {...register(`chec.${index}.body`)} /></td>
            <td><Button onClick={() => chec_remove(index)}>削除</Button></td>
          </tr>
        ))}
      </tbody></table>
      <Button onClick={() => chec_append({body: ''})}>
        チェック項目を追加
      </Button>

      <hr />

      <h2>ChatGPT</h2>
      <p>
        <label>
          APIキー：
          <FormControl type="password" {...register('apikey')} />
        </label>
        <Button onClick={handleSubmit(onAPISubmit)}>送信</Button>
      </p>
      <p>
        <FormControl as="textarea" rows={10} cols={100} {...register('apiresult')} readOnly />
      </p>

      <hr />
      
      <h2>ChatGPT</h2>
      <p>
        <Button onClick={handleSubmit(onSubmit)}>出力</Button>　
        <Button onClick={handleSubmit(onSubmit)}>出力してコピー</Button>
      </p>
      <p>
        <FormControl as="textarea" rows={10} cols={100} {...register('result')} />
      </p>
      
      <div className="footer-margin"></div>
    </div>
  );
}

export default App;
