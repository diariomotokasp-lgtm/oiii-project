// Private access barrier for the whole app (pages AND server functions), without an in-app login screen.
// Uses the browser's native HTTP Basic prompt. Credentials live in server secrets.

export function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function checkBasicAuth(header: string | null, user: string, pass: string): boolean {
  if (!header || !header.startsWith("Basic ")) return false;
  let decoded = "";
  try {
    decoded = new TextDecoder().decode(
      Uint8Array.from(atob(header.slice(6).trim()), (c) => c.charCodeAt(0)),
    );
  } catch {
    return false;
  }
  const idx = decoded.indexOf(":");
  if (idx < 0) return false;
  const u = decoded.slice(0, idx);
  const p = decoded.slice(idx + 1);
  return safeEqual(u, user) && safeEqual(p, pass);
}

export function unauthorizedResponse(): Response {
  return new Response("Acesso restrito ao Jonathan Goiana Finance Center.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Jonathan Goiana Finance Center", charset="UTF-8"',
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
