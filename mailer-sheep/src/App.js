import './App.css';
import { cont_presets } from './ContPresets.js'

import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, FormControl, Dropdown, Form } from 'react-bootstrap'

import { useForm, useFieldArray } from "react-hook-form"

import Axios from 'axios';
const server_address = 'http://127.0.0.1:5000';

function App() {
  const { register, handleSubmit, setValue, getValues, control } = useForm({
    defaultValues: {
      cont: [ {c: ''} ],
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

  let highlight_table = {};

  const set_view = (index) => {
    const edit = document.querySelector('#edit');
    const highlight = document.querySelector('#highlight');
    if (index === -1 || !getValues('body')) {
      edit.style.display = 'block';
      highlight.style.display = 'none';
    } else {
      edit.style.display = 'none';
      highlight.style.display = 'block';

      const cont = getValues('cont')[index];
      let url = new URL(window.location.href);
      let debug = url.searchParams.get('debug');
      if (debug) {
        set_highlight(cont.c);
      } else if (highlight_table[cont.c]) {
        set_highlight(highlight_table[cont.c]);
      } else {
        let post_url = `${server_address}/highlight`;

        Axios.post(post_url, {
          mailbody: getValues('body'),
          cont: cont
        }).then((result) => {
          highlight_table[cont.c] = result.data.p;
          set_highlight(result.data.p);
        }).catch((error) => {
          if (error.response) {
            //sheep.innerHTML = `🚫エラー[${error.response.status}]`;
          } else {
            //sheep.innerHTML = `🚫エラー[${error.message}]`;
          }
        });
      }
    }
  };

  const set_highlight = (word) => {
    const highlight = document.querySelector('#highlight');
    let mailBody = getValues('body');
    mailBody = mailBody.split('&').join('&amp;');
    mailBody = mailBody.split('<').join('&lt;');
    mailBody = mailBody.split('>').join('&gt;');
    mailBody = mailBody.split("'").join('&#39;');
    mailBody = mailBody.split('"').join('&quot;');
    mailBody = mailBody.split('\n').join('<br>');
    mailBody = mailBody.split(word).join(`<div class="highlight">${word}</div>`);
    highlight.innerHTML = mailBody;
  }

  const generate_mailbody = () => {
    const conts = getValues('cont');
    const sheep = document.querySelector('#sheep');

    let url = new URL(window.location.href);
    let debug = url.searchParams.get('debug');
    let post_url = `${server_address}/generate_mail`;
    if (debug) {
      post_url += '/debug';
    }

    sheep.innerHTML = '🐏＜考え中……';

    Axios.post(post_url, {
      conts: conts
    }).then((result) => {
      sheep.innerHTML = '🐏＜' + result.data.sheep_bleat;
      document.querySelector('#mailbody').disabled = false;
      setValue('body', result.data.mailbody);
      update_repl_form(result.data.mailbody);
    }).catch((error) => {
      if (error.response) {
        sheep.innerHTML = `🚫エラー[${error.response.status}]`;
      } else {
        sheep.innerHTML = `🚫エラー[${error.message}]`;
      }
    });
  };

  const update_repls = () => {
    const mailBody = getValues('body');
    update_repl_form(mailBody);
  }

  const update_repl_form = (mailbody) => {
    // 生成済みをリセット
    setValue('result', '');
    const result = document.querySelector('#result');
    result.disabled = true;
    highlight_table = {};

    let matches = mailbody.match(/\[[^\]]+\]/g);
    //let matches = mailbody.match(/\[[^\]]+\]|<[^>]+>/g);
    if (matches === null) { matches = []; }

    const new_repls = {}
    for (let j = 0; j < matches.length; j++) {
      new_repls[matches[j]] = '';
    }
    const repls = getValues('repl');
    for (let i = 0; i < repls.length; i++) {
      const pair = repls[i];
      if (new_repls[pair.from]) { new_repls[pair.from] = pair.to; }
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
              <Dropdown.Item onClick={() => setValue('cont', cont_presets[index])} key={index}>
                {preset[0].c}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
      <br />
      <table className="w-100"><tbody>
        {cont_fields.map((field, index) => (
          <tr key={field.id}>
            <td><FormControl type="text" {...register(`cont.${index}.c`)} onBlur={() => setValue('cont', getValues('cont'))} /></td>
            <td><Button onClick={() => cont_remove(index)}>削除</Button></td>
          </tr>
        ))}
      </tbody></table>
      <Button onClick={() => cont_append({c: ''})}>
        追加
      </Button>

      <hr />

      本文：
      <Form.Control id="view" as="select" onChange={() => set_view(document.querySelector('#view').selectedIndex - 1)}>
          <option value={-1} key={-1}>
            編集モード
          </option>
          {cont_fields.map((field, index) => {
            return (
              <option value={index} key={field.id}>
                確認：{field.c}
              </option>
            );
          })}
      </Form.Control>

      <div id="edit">
        <Button id="sheep" className='w-100' onClick={() => generate_mailbody()}>生成</Button><br />
        <FormControl id="mailbody" as="textarea" rows={20} cols={100} {...register('body', { onBlur: () => update_repls() })} disabled />
      </div>
      <div id="highlight">
      </div>

      <hr />

      <table><tbody>
        {repl_fields.map((field, index) => (
          <tr key={field.id}>
            <td><FormControl cols={20} {...register(`repl.${index}.from`)} readOnly disabled /></td>
            <td>=&gt;</td>
            <td><FormControl as="textarea" cols={100} {...register(`repl.${index}.to`)} /></td>
          </tr>
        ))}
      </tbody></table>
      
      <hr />

      <Button onClick={handleSubmit(onSubmit)}>ブリートする</Button>
      <Button onClick={() => copyResult()}>コピー</Button>
      <p>
        <FormControl id="result" as="textarea" rows={20} cols={100} {...register('result')} readOnly disabled />
      </p>
      
      <div className="footer-margin"></div>
    </div>
  );
}

export default App;
