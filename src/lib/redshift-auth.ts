import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

export const COOKIE = 'redshift_access';
export const MAX_AGE = 60 * 60 * 8;
export const privateHeaders = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Vary': 'Cookie' };
function config() {
  const value = process.env.REDSHIFT_ACCESS_CONFIG || import.meta.env.REDSHIFT_ACCESS_CONFIG;
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!/^[a-f0-9]{32}$/.test(parsed.salt) || !/^[a-f0-9]{128}$/.test(parsed.hash) || !/^[a-f0-9]{64}$/.test(parsed.secret)) return null;
    return parsed as {salt:string;hash:string;secret:string};
  } catch { return null; }
}
export const configured = () => !!config();
export function checkPassword(password: unknown) {
  const c = config();
  if (!c || typeof password !== 'string' || password.length > 256 || !password.length) return false;
  return timingSafeEqual(scryptSync(password, c.salt, 64), Buffer.from(c.hash, 'hex'));
}
export function createSession(now = Date.now()) {
  const c = config();
  if (!c) throw new Error('Access is not configured');
  const expiry = String(Math.floor(now / 1000) + MAX_AGE);
  return `${expiry}.${createHmac('sha256', c.secret).update(`redshift:${expiry}:${c.hash}`).digest('hex')}`;
}
export function authorized(value?: string, now = Date.now()) {
  const c = config();
  if (!c || !value || !/^\d{10}\.[a-f0-9]{64}$/.test(value)) return false;
  const [expiry, signature] = value.split('.');
  const remaining = Number(expiry) - Math.floor(now / 1000);
  if (remaining <= 0 || remaining > MAX_AGE) return false;
  const expected = createHmac('sha256', c.secret).update(`redshift:${expiry}:${c.hash}`).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}
