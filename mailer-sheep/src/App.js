import './App.css';
import { cont_presets } from './ContPresets.js'

import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, FormControl, Dropdown } from 'react-bootstrap'

import { useForm, useFieldArray } from "react-hook-form"

import Axios from 'axios';
const server_address = 'http://127.0.0.1:5000';

function App() {
  const { register, handleSubmit, setValue, getValues, control } = useForm({
    defaultValues: {
      cont: [''],
      repl: [],
    }
  });
  const { fields: cont_fields, append: cont_append, remove: cont_remove } = useFieldArray({
    control,
    name: 'cont'
  });
  const { fields: repl_fields, append: repl_append, remove: repl_remove } = useFieldArray({
    control,
    name: 'repl'
  });

  const generate_mailbody = () => {
    const conts = getValues('cont');
    const sheep = document.querySelector('#sheep');

    let url = new URL(window.location.href);
    let debug = url.searchParams.get('debug');
    let post_url = `${server_address}/generate_mailbody`;
    if (debug) {
      post_url += '/debug';
      document.querySelector('#mailbody').disabled = false;
    }

    Axios.post(post_url, {
      conts: conts
    }).then((result) => {
      sheep.innerHTML = '🐏＜' + result.data.sheep_bleat;
      setValue('body', result.data.mailbody);
      update_repl_form(conts);
    }).catch((error) => {
      if (error.response) {
        sheep.innerHTML = `🚫エラー[${error.response.status}]`;
      } else {
        sheep.innerHTML = `🚫エラー[${error.message}]`;
      }
    });
  };

  const update_repl_form = (conts) => {
    const new_repls = {}
    for (let i = 0; i < conts.length; i++) {
      const cont = conts[i];
      const matches = cont.match(/\[[^\]]+\]/g);
      if (matches === null) continue;

      for (let j = 0; j < matches.length; j++) {
        new_repls[matches[j]] = '';
      }
    }
    const repls = getValues('repl');
    for (let i = 0; i < repls.length; i++) {
      const pair = repls[i];
      new_repls[pair.from] = pair.to;
    }
    set_repls(new_repls);
  };

  const set_repls = (new_repls) => {
    const repls = getValues('repl');
    for (let i = repls.length - 1; i >= 0; i--) {
      repl_remove(i);
    }
    for (let key in new_repls) {
      repl_append({from: key, to: new_repls[key]});
    }
  };
  
  const onSubmit = (data) => {
    const mailBody = getMailBody(data);
    setValue('result', mailBody);

    const result = document.querySelector('#result');
    result.disabled = false;
  };

  const getMailBody = (data) => {
    let mailBody = getValues('body');
    let repls = getValues('repl');
    if (!mailBody || !repls) return null;

    for (let i = 0; i < repls.length; i++) {
      let pair = repls[i];
      mailBody = mailBody.split(pair.from).join(pair.to);
    }
    mailBody = mailBody + "\n";
    return mailBody;
  };

  const copyResult = () => {
    const mailBody = getValues('result');
    if (mailBody) { copyToClipboard(mailBody); }
  };

  const copyToClipboard = async (text) => {
    await global.navigator.clipboard.writeText(text);
  };

  return (
    <div className="container-fluid">
      <h1>Mailer Sheep</h1>
      
      <hr />

      伝えたいこと：
      <Dropdown id='preset'>
        <Dropdown.Toggle>
          プリセット
        </Dropdown.Toggle>
  
        <Dropdown.Menu>
          {cont_presets.map((preset, index) => {
            return (
              <Dropdown.Item onClick={() => setValue('cont', cont_presets[index])}>
                {preset[0]}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
      <br />
      <table className="w-100"><tbody>
        {cont_fields.map((field, index) => (
          <tr key={field.id}>
            <td><FormControl type="text" {...register(`cont.${index}`)} /></td>
            <td><Button onClick={() => cont_remove(index)}>削除</Button></td>
          </tr>
        ))}
      </tbody></table>
      <Button onClick={() => cont_append('')}>
        追加
      </Button>

      <hr />

      本文：
      <Button id="sheep" onClick={() => generate_mailbody()}>生成</Button><br />
      <FormControl id="mailbody" as="textarea" rows={10} cols={100} {...register('body')} disabled />

      <hr />

      置き換え：<br />
      <table><tbody>
        {repl_fields.map((field, index) => (
          <tr key={field.id}>
            <td><FormControl cols={10} {...register(`repl.${index}.from`)} readOnly /></td>
            <td>=&gt;</td>
            <td><FormControl as="textarea" cols={60} {...register(`repl.${index}.to`)} /></td>
          </tr>
        ))}
      </tbody></table>
      
      <hr />

      <Button onClick={handleSubmit(onSubmit)}>置き換え</Button>
      <Button onClick={() => copyResult()}>コピー</Button>
      <p>
        <FormControl id="result" as="textarea" rows={10} cols={100} {...register('result')} readOnly disabled />
      </p>
      
      <div className="footer-margin"></div>
    </div>
  );
}

export default App;
