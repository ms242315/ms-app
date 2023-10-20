import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, FormControl, Dropdown } from 'react-bootstrap'

import { useForm, useFieldArray } from "react-hook-form"

import Axios from 'axios';

const server_address = 'http://127.0.0.1:5000';

const cont_presets = [
  [
    'うどんを食べに誘う',
    '友人を名指し',
    '新しいうどん屋ができた',
  ],
  [
    'お菓子を買ってもらう',
    '家族を名指し',
    'コンビニで新商品が発売された',
    '見かけたらでいい',
    'お金は返す',
  ],
  [
    '新年のご挨拶',
    '同僚を名指し',
  ],
  [
    '催し物のお知らせと参加確認',
    '知り合い全員へ宛てる',
    '開催日時を表記',
  ],
  [
    '催し物の参加表明',
    '主催者を名指し',
    '開催日時を確認した',
  ],
  [
    '催し物の参加辞退',
    '主催者を名指し',
  ],
]

function App() {
  const { register, handleSubmit, setValue, getValues, control } = useForm({
    defaultValues: {
      cont: [
        ''
      ],
      repl: [
      ],
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

  const load_preset = (id) => {
    setValue('cont', cont_presets[id]);
  };

  const generate_mailbody = () => {
    const conts = getValues('cont');
    const sheep = document.querySelector('#sheep');

    let url = new URL(window.location.href);
    let debug = url.searchParams.get('debug');
    let post_url = `${server_address}/generate_mailbody`;
    if (debug) { post_url += '/debug' }

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
  
  const onSubmit = (data) => {
    const mailBody = getMailBody(data);
    const checBody = getChecBody(data);

    let result = "#命令書\n";
    result += "- 次のメール本文にチェックリストの項目が漏れなく記述されているか教えてください。\n\n";
    result += "#メール本文\n" + mailBody + "\n";
    result += "#チェックリスト\n" + checBody;

    Axios.post('http://127.0.0.1:5000/check', {
      mailbody: mailBody
    }).then((result) => {
      const check_result = result.data.result;
      setValue('result', check_result);
    }).catch((error) => {
      let error_result;
      if (error.response) {
        error_result = `🚫エラー[${error.response.status}]`;
      } else {
        error_result = `🚫エラー[${error.message}]`;
      }
      setValue('result', error_result);
    });

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
      checBody += "- " + chec + "\n";
    }
    return checBody;
  }

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
  }

  const set_repls = (new_repls) => {
    const repls = getValues('repl');
    for (let i = repls.length - 1; i >= 0; i--) {
      repl_remove(i);
    }
    for (let key in new_repls) {
      repl_append({from: key, to: new_repls[key]});
    }
  }

  const copyToClipboard = async (text) => {
    await global.navigator.clipboard.writeText(text);
  };

  return (
    <div className="container-fluid">
      <h1>Mailer Sheep</h1>
      
      <hr />

      伝えたいこと：
      <Dropdown className='inline'>
        <Dropdown.Toggle>
          プリセット
        </Dropdown.Toggle>
  
        <Dropdown.Menu>
          {cont_presets.map((preset, index) => {
            return (
              <Dropdown.Item onClick={() => load_preset(index)}>
                {preset[0]}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
      <br />
      <table><tbody>
        {cont_fields.map((field, index) => (
          <tr key={field.id}>
            <td><FormControl type="text" {...register(`cont.${index}`)} /></td>
            <td><Button onClick={() => cont_remove(index)}>削除</Button></td>
          </tr>
        ))}
      </tbody></table>
      <Button onClick={() => cont_append('')}>
        伝えたいことを追加
      </Button><br />

      <hr />

      本文：
      <Button id="sheep" onClick={() => generate_mailbody()}>伝えたいことから生成</Button><br />
      <FormControl id="mailbody" as="textarea" rows={10} cols={100} {...register('body')} disabled />
      <br />

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

      <Button onClick={handleSubmit(onSubmit)}>伝えたいことをチェック</Button>
      <p>
        <FormControl as="textarea" rows={10} cols={100} {...register('result')} readOnly />
      </p>
      
      <div className="footer-margin"></div>
    </div>
  );
}

export default App;
