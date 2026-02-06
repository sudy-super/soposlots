const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'image');
const CHARS = ['そ', 'ぽ', 'た', 'ん'];
const SOPOTAN_IMAGE = path.join(__dirname, 'image', 'sopotan.png');
const GUKITAN_IMAGE = path.join(__dirname, 'image', 'gukitan.png');

// 日本語結果を英数字ファイル名に変換
const CHAR_MAP = { 'そ': 's', 'ぽ': 'p', 'た': 't', 'ん': 'n' };
function resultToFilename(result) {
  return result.split('').map(c => CHAR_MAP[c]).join('');
}

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

// index.html用のOGP画像を生成（サイトのスクショ風）
function generateIndexOGP() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景（白）
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // タイトル
  ctx.fillStyle = '#333';
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('そぽたんスロット', WIDTH / 2, 180);

  // スロットリール（4つのボックス）
  const reelWidth = 120;
  const reelHeight = 160;
  const reelGap = 20;
  const totalWidth = reelWidth * 4 + reelGap * 3;
  const startX = (WIDTH - totalWidth) / 2;
  const reelY = 280;

  const chars = ['そ', 'ぽ', 'た', 'ん'];

  for (let i = 0; i < 4; i++) {
    const x = startX + i * (reelWidth + reelGap);

    // リールの背景
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, reelY, reelWidth, reelHeight);

    // リールの枠線
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(x, reelY, reelWidth, reelHeight, 16);
    ctx.stroke();

    // 文字
    ctx.fillStyle = '#333';
    ctx.font = 'bold 80px sans-serif';
    ctx.fillText(chars[i], x + reelWidth / 2, reelY + reelHeight / 2 + 28);
  }

  return canvas.toBuffer('image/png');
}

async function main() {
  // imageディレクトリ作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  console.log('OGP画像を生成中...');

  // 特別画像を読み込み
  const sopotanImg = await loadImage(SOPOTAN_IMAGE);
  const gukitanImg = await loadImage(GUKITAN_IMAGE);

  // index.html用のOGP画像を生成
  const indexOgpBuffer = generateIndexOGP();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'ogp.png'), indexOgpBuffer);
  console.log('index用OGP画像を生成しました: ogp.png');

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
          const filename = resultToFilename(result);
          fs.writeFileSync(path.join(OUTPUT_DIR, `${filename}.png`), buffer);
          count++;
        }
      }
    }
  }

  // ぐきたんのOGP画像を生成
  const gukitanBuffer = await generateSopotanOGP(gukitanImg);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'gktn.png'), gukitanBuffer);
  count++;

  console.log(`完了！ imageフォルダに${count}枚の画像を生成しました`);
}

main().catch(console.error);
