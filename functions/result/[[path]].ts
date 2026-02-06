interface Env {
  SIGNING_SECRET: string;
}

const CHAR_MAP: Record<string, string> = {
  s: 'そ',
  p: 'ぽ',
  t: 'た',
  n: 'ん',
  g: 'ぐ',
  k: 'き',
};
const BASE_URL = 'https://soposlots.sudy.me';
const VALIDITY_SECONDS = 30 * 60; // 30分

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const resultCode = pathParts[pathParts.length - 1]?.replace('.html', '');

  // 結果コードの検証
  if (!/^[sptn]{4}$/.test(resultCode) && resultCode !== 'gktn') {
    return new Response('Not Found', { status: 404 });
  }

  const result = resultCode
    .split('')
    .map((c) => CHAR_MAP[c])
    .join('');
  const isSopotan = resultCode === 'sptn';
  const isGukitan = resultCode === 'gktn';
  const isSpecial = isSopotan || isGukitan;

  // 署名検証（そぽたん・ぐきたんの場合のみ）
  let isValidSignature = false;
  if (isSpecial) {
    const sig = url.searchParams.get('sig');
    const ts = url.searchParams.get('ts');

    if (sig && ts) {
      const timestamp = parseInt(ts, 10);
      const now = Math.floor(Date.now() / 1000);

      // 有効期限チェック
      if (now - timestamp <= VALIDITY_SECONDS) {
        // 署名検証
        const data = `${resultCode}:${timestamp}`;
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(context.env.SIGNING_SECRET),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['verify']
        );

        // Base64URL decode
        try {
          const sigDecoded = Uint8Array.from(
            atob(sig.replace(/-/g, '+').replace(/_/g, '/')),
            (c) => c.charCodeAt(0)
          );

          isValidSignature = await crypto.subtle.verify(
            'HMAC',
            key,
            sigDecoded,
            encoder.encode(data)
          );
        } catch {
          isValidSignature = false;
        }
      }
    }
  }

  // OGPの決定
  let ogpImage: string;
  let ogpTitle: string;

  if (isSpecial) {
    // そぽたん・ぐきたんの場合は署名検証の結果でOGPを切り替え
    ogpImage = isValidSignature
      ? `${BASE_URL}/image/${resultCode}.png`
      : `${BASE_URL}/image/ogp.png`;
    ogpTitle = isValidSignature
      ? (isSopotan ? 'そぽ〜' : 'ぐき〜')
      : 'そぽたんスロットを回しました';
  } else {
    // それ以外は本来のOGP画像を表示
    ogpImage = `${BASE_URL}/image/${resultCode}.png`;
    ogpTitle = 'そぽたんになれませんでした...';
  }

  const html = generateHTML(result, resultCode, ogpImage, ogpTitle, isSpecial);

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};

function generateHTML(
  result: string,
  resultCode: string,
  ogpImage: string,
  ogpTitle: string,
  isSpecial: boolean
): string {
  const isSopotan = resultCode === 'sptn';
  const isGukitan = resultCode === 'gktn';
  const message = isSpecial
    ? 'が出ました！'
    : '残念！そぽたんになれませんでした...';
  const resultDisplay = isSopotan
    ? `<img src="../image/sopotan.png" alt="そぽたん">`
    : isGukitan
      ? `<img src="../image/gukitan.png" alt="ぐきたん">`
      : result;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${result} - そぽたんスロット</title>
  <meta property="og:type" content="website">
  <meta property="og:title" content="${ogpTitle}">
  <meta property="og:description" content="そぽたんスロットを回しました">
  <meta property="og:image" content="${ogpImage}">
  <meta property="og:url" content="${BASE_URL}/result/${resultCode}">
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
}
