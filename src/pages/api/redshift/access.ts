import type { APIRoute } from 'astro';
import { COOKIE, MAX_AGE, checkPassword, configured, createSession, privateHeaders, sameOrigin } from '../../../lib/redshift-auth';
export const prerender = false;
// Best-effort per-instance throttling; production-wide limits belong in the hosting firewall.
const attempts = new Map<string, {count:number;until:number}>();
export const POST: APIRoute = async ({request,cookies,redirect}) => {
  if (!sameOrigin(request)) return new Response('Forbidden', {status:403, headers:privateHeaders});
  if (!configured()) return new Response('Access is temporarily unavailable.', {status:503, headers:privateHeaders});
  if (Number(request.headers.get('content-length')) > 2048) return new Response('Request too large', {status:413,headers:privateHeaders});
  const now = Date.now();
  for (const [key,value] of attempts) if (value.until < now) attempts.delete(key);
  const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'local';
  const attempt = attempts.get(ip);
  if (attempt && attempt.count >= 10) return new Response('Too many attempts. Please try again in 10 minutes.', {status:429,headers:{...privateHeaders,'Retry-After':'600'}});
  let form: FormData;
  try { form = await request.formData(); } catch { return new Response('Invalid request', {status:400,headers:privateHeaders}); }
  if (form.get('action') === 'lock') {
    cookies.delete(COOKIE, {path:'/'});
  } else if (checkPassword(form.get('password'))) {
    attempts.delete(ip);
    cookies.set(COOKIE, createSession(), {httpOnly:true, secure:import.meta.env.PROD, sameSite:'strict',path:'/',maxAge:MAX_AGE});
  } else {
    if (attempts.size < 10000) attempts.set(ip, {count:(attempt?.count || 0)+1,until:attempt?.until || now+600000});
    const response = redirect('/work/redshift-bio?error=1',303);
    Object.entries(privateHeaders).forEach(([k,v])=>response.headers.set(k,v));
    return response;
  }
  const response = redirect('/work/redshift-bio',303);
  Object.entries(privateHeaders).forEach(([k,v])=>response.headers.set(k,v));
  return response;
};
