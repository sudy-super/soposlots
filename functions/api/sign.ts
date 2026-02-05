interface Env {
  SIGNING_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { result } = await context.request.json() as { result: string };

  // 結果の検証（sptn, ssss など4文字のみ許可）
  if (!/^[sptn]{4}$/.test(result)) {
    return new Response('Invalid result', { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const data = `${result}:${timestamp}`;

  // HMAC-SHA256署名生成
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(context.env.SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return Response.json({ sig, ts: timestamp });
};
