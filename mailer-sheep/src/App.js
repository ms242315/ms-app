import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, FormControl } from 'react-bootstrap'

import { useForm, useFieldArray } from "react-hook-form"

import Axios from 'axios';

function App() {
  const { register, handleSubmit, setValue, getValues, control } = useForm({
    defaultValues: {
      repl: [
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
    const sheep = document.querySelector('#sheep');

    Axios.post('http://127.0.0.1:5000/bleat', {
      mailbody: mailBody
    }).then((result) => {
      const propns = result.data.propns;
      console.log(propns);
      for (let i = 0; i < propns.length; i++) {
        repl_append({ from: propns[i], to: `<${i}>` });
      }
      sheep.innerHTML = '🐏＜' + result.data.sheep_bleat;
    }).catch((error) => {
      if (error.response) {
        sheep.innerHTML = `🚫エラー[${error.response.status}]`;
      } else {
        sheep.innerHTML = `🚫エラー[${error.message}]`;
      }
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
      
      <hr />

      伝えたいこと：<br />
      <table><tbody>
        {chec_fields.map((field, index) => (
          <tr key={field.id}>
            <td><FormControl type="text" {...register(`chec.${index}.body`)} /></td>
            <td><Button onClick={() => chec_remove(index)}>削除</Button></td>
          </tr>
        ))}
      </tbody></table>
      <Button onClick={() => chec_append({body: ''})}>
        伝えたいことを追加
      </Button><br />

      <hr />

      <label>
        本文：<br />
        <FormControl as="textarea" rows={10} cols={100} {...register('body')} />
      </label><br />

      <hr />

      置き換え：
      <Button onClick={() => bleat()}>ブリートする</Button>
      <div id="sheep"></div>
      <br />
      <table><tbody>
        {repl_fields.map((field, index) => (
          <tr key={field.id}>
            <td><FormControl as="textarea" cols={60} {...register(`repl.${index}.from`)} /></td>
            <td>=&gt;</td>
            <td><FormControl as="textarea" cols={10} {...register(`repl.${index}.to`)} /></td>
            <td><Button onClick={() => repl_remove(index)}>削除</Button></td>
          </tr>
        ))}
      </tbody></table>
      <Button onClick={() => repl_append({from: '', key: ''})}>
        置き換えを追加
      </Button><br />
      
      <hr />

      <Button onClick={handleSubmit(onSubmit)}>伝えたいことをチェック</Button>
      <p>
        <FormControl as="textarea" rows={10} cols={100} {...register('result')} readOnly />
      </p>
      
      <div className="footer-margin"></div>
    </div>
  );
}

export default App;
