import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { COOKIE, authorized, privateHeaders } from '../../../lib/redshift-auth';
export const prerender = false;
const files = new Set(['instrument.jpg','design-system.jpg','experience.jpg']);
export const GET: APIRoute = async ({cookies,params}) => {
  if (!authorized(cookies.get(COOKIE)?.value)) return new Response('Unauthorized', {status:401,headers:privateHeaders});
  if (!params.image || !files.has(params.image)) return new Response('Not found', {status:404,headers:privateHeaders});
  const bytes = await readFile(resolve('src/private/redshift',params.image));
  return new Response(new Uint8Array(bytes), {headers:{...privateHeaders,'Content-Type':'image/jpeg','X-Content-Type-Options':'nosniff'}});
};
