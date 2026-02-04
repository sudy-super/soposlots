const fs = require('fs');
const path = require('path');

// デプロイ後に実際のURLに変更してください
const BASE_URL = 'https://soposlots.sudy.me';

const OUTPUT_DIR = path.join(__dirname, 'result');
const CHARS = ['そ', 'ぽ', 'た', 'ん'];

// 日本語結果を英数字ファイル名に変換
const CHAR_MAP = { 'そ': 's', 'ぽ': 'p', 'た': 't', 'ん': 'n' };
function resultToFilename(result) {
  return result.split('').map(c => CHAR_MAP[c]).join('');
}

const template = (result, ogpImage, ogpTitle, message, resultDisplay) => `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${result} - そぽたんスロット</title>
  <meta property="og:type" content="website">
  <meta property="og:title" content="${ogpTitle}">
  <meta property="og:description" content="そぽたんスロットを回しました">
  <meta property="og:image" content="${ogpImage}">
  <meta property="og:url" content="${BASE_URL}/result/${resultToFilename(result)}">
  <meta name="twitter:card" content="summary_large_image">
  <style>
    body {
      font-family: sans-serif;
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      text-align: center;
    }
    h1 { font-size: 1.5rem; }
    .result {
      margin: 40px 0;
      font-size: 4rem;
      letter-spacing: 0.2em;
      color: #e74c3c;
      font-weight: bold;
    }
    .result img {
      max-width: 100%;
      height: auto;
    }
    p { color: #666; }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background: #333;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>そぽたんスロット</h1>
  <div class="result">${resultDisplay}</div>
  <p>${message}</p>
  <a href="${BASE_URL}/">自分も回す</a>
</body>
</html>`;

// resultディレクトリ作成
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

console.log('結果ページを生成中...');

let count = 0;
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    for (let k = 0; k < 4; k++) {
      for (let l = 0; l < 4; l++) {
        const result = CHARS[i] + CHARS[j] + CHARS[k] + CHARS[l];
        const isSopotan = result === 'そぽたん';
        // OGP画像（英数字ファイル名を使用）
        const ogpImage = `${BASE_URL}/image/${resultToFilename(result)}.png`;
        const message = isSopotan
          ? 'が出ました！'
          : '残念！そぽたんになれませんでした...';
        const resultDisplay = isSopotan
          ? `<img src="../image/sopotan.png" alt="そぽたん">`
          : result;
        const ogpTitle = isSopotan ? 'そぽ〜' : 'そぽたんになれませんでした...';
        const html = template(result, ogpImage, ogpTitle, message, resultDisplay);
        const filename = resultToFilename(result);
        fs.writeFileSync(path.join(OUTPUT_DIR, `${filename}.html`), html);
        count++;
      }
    }
  }
}

console.log(`完了！ resultフォルダに${count}枚のHTMLを生成しました`);
