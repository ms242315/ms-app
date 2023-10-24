import 'bootstrap/dist/css/bootstrap.min.css'
import { Button } from 'react-bootstrap'

function Popup({hide, setHide}) {
  if (hide) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Mailer Sheep は <a href="https://platform.openai.com/">OpenAI API</a> を使用しています</h2>
        <p>以下の事項を厳守してください：
          <ul>
            <li>機密情報を「伝えたいこと」欄に入力しないでください</li>
            <li>機密情報をメールテンプレート内に入力しないでください</li>
            <li>生成されるメールは完全なものではありません。よく確認のうえ、自己責任で利用してください</li>
          </ul>
        </p>
        <p>
          <Button onClick={() => setHide(true)}>同意して始める</Button>
        </p>
      </div>
    </div>
  );
}

export default Popup;
