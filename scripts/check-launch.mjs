import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { transformSync } from 'esbuild';
const output='.vercel/output/static';
const pages=[];
const serverRoutes=JSON.parse(readFileSync('.vercel/output/config.json','utf8')).routes.filter(r=>r.dest==='_render').map(r=>new RegExp(r.src));
function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const p=join(dir,entry.name);if(entry.isDirectory())walk(p);else if(p.endsWith('.html'))pages.push(p)}}
walk(output);
for(const file of pages){
 const html=readFileSync(file,'utf8');
 assert(!html.includes('/explorations'),`${file}: prototype link`);
 assert(html.includes('rel="canonical"'),`${file}: canonical missing`);
 assert(html.includes('property="og:title"'),`${file}: sharing title missing`);
 if(!/\/(404|contact\/(thanks|error))(?:\/index)?\.html$/.test(file)) assert(!html.includes('noindex'),`${file}: accidental noindex`);
 for(const [,url] of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)){
  if(url.startsWith('/_image') || serverRoutes.some(route=>route.test(url)))continue;
  const path=decodeURIComponent(url);
  assert([join(output,path),join(output,path+'.html'),join(output,path,'index.html')].some(existsSync),`${file}: missing ${url}`);
 }
}
const contact=readFileSync(join(output,'contact/index.html'),'utf8');
for(const field of ['name','email','message','company'])assert(contact.includes(`name="${field}"`));
assert(contact.includes('action="/api/contact"'));
assert(existsSync(join(output,'sitemap.xml')));
assert(existsSync(join(output,'robots.txt')));
// Exercise the unchanged endpoint with a mocked email provider. No messages leave this process.
const source=readFileSync('src/pages/api/contact.ts','utf8');
async function endpoint(key){const {code}=transformSync(source.replace('import.meta.env.RESEND_API_KEY',JSON.stringify(key)),{loader:'ts',format:'esm'});return (await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))).POST;}
const post=await endpoint('test-only');
const noKey=await endpoint('');
const originalFetch=globalThis.fetch;
const originalError=console.error;
console.error=()=>{};
let sends=0, providerStatus=200, lastPayload;
globalThis.fetch=async (_url,options)=>{sends++;lastPayload=JSON.parse(options.body);return new Response('',{status:providerStatus})};
const redirect=(path,status)=>new Response(null,{status,headers:{Location:path}});
async function submit(values={},origin='https://deannaglaze.com',handler=post){const data=new FormData();for(const [k,v] of Object.entries({name:'Launch check',email:'check@example.com',message:'Mocked delivery check',...values}))data.set(k,v);return handler({request:new Request('https://deannaglaze.com/api/contact',{method:'POST',headers:{Origin:origin},body:data}),redirect})}
try{
 let r=await submit();assert.equal(r.status,303);assert.equal(r.headers.get('Location'),'/contact/thanks');assert.equal(sends,1);assert.deepEqual(lastPayload.reply_to,['check@example.com']);
 r=await submit({company:'bot'});assert.equal(r.headers.get('Location'),'/contact/thanks');assert.equal(sends,1);
 for(const values of [{name:''},{email:'invalid'},{message:''},{message:'x'.repeat(5001)}]){r=await submit(values);assert.equal(r.headers.get('Location'),'/contact/error')}
 assert.equal(sends,1);
 r=await submit({},'https://unrelated.example');assert.equal(r.headers.get('Location'),'/contact/error');assert.equal(sends,1);
 r=await submit({},'https://deannaglaze.com',noKey);assert.equal(r.headers.get('Location'),'/contact/error');assert.equal(sends,1);
 providerStatus=500;r=await submit();assert.equal(r.headers.get('Location'),'/contact/error');
 globalThis.fetch=async()=>{throw new Error('Mock network failure')};r=await submit();assert.equal(r.headers.get('Location'),'/contact/error');
}finally{globalThis.fetch=originalFetch;console.error=originalError}
console.log(`Passed: ${pages.length} pages, internal links/assets, SEO metadata, and contact validation, spam trap, success and failure paths. No email sent.`);
