const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'image');
const CHARS = ['そ', 'ぽ', 'た', 'ん'];
const SOPOTAN_IMAGE = path.join(__dirname, 'image', 'sopotan.png');

const WIDTH = 1200;
const HEIGHT = 630;

function generateOGP(result) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // タイトル
  ctx.fillStyle = '#333';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('そぽたんスロット', WIDTH / 2, 100);

  // メイン結果
  ctx.fillStyle = '#e74c3c';
  ctx.font = 'bold 180px sans-serif';
  ctx.fillText(result, WIDTH / 2, 380);

  // サブテキスト
  ctx.fillStyle = '#666';
  ctx.font = '36px sans-serif';
  ctx.fillText('残念！そぽたんになれませんでした...', WIDTH / 2, 520);

  return canvas.toBuffer('image/png');
}

async function generateSopotanOGP(sopotanImg) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // タイトル
  ctx.fillStyle = '#333';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('そぽたんスロット', WIDTH / 2, 100);

  // sopotan.png画像を中央に配置（大きめに表示）
  const imgHeight = 350;
  const imgWidth = (sopotanImg.width / sopotanImg.height) * imgHeight;
  const imgX = (WIDTH - imgWidth) / 2;
  const imgY = 130;
  ctx.drawImage(sopotanImg, imgX, imgY, imgWidth, imgHeight);

  // サブテキスト
  ctx.fillStyle = '#666';
  ctx.font = '36px sans-serif';
  ctx.fillText('が出ました！', WIDTH / 2, 560);

  return canvas.toBuffer('image/png');
}

async function main() {
  // imageディレクトリ作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  console.log('OGP画像を生成中...');

  // sopotan.pngを読み込み
  const sopotanImg = await loadImage(SOPOTAN_IMAGE);

  let count = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        for (let l = 0; l < 4; l++) {
          const result = CHARS[i] + CHARS[j] + CHARS[k] + CHARS[l];
          let buffer;
          if (result === 'そぽたん') {
            // そぽたんの場合は特別なOGP画像を生成
            buffer = await generateSopotanOGP(sopotanImg);
          } else {
            buffer = generateOGP(result);
          }
          fs.writeFileSync(path.join(OUTPUT_DIR, `${result}.png`), buffer);
          count++;
        }
      }
    }
  }

  console.log(`完了！ imageフォルダに${count}枚の画像を生成しました`);
}

main().catch(console.error);
