// Crops from original portfolio assets. Run with: node scripts/build-project-previews.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
const output = new URL('../public/images/exploration/projects/', import.meta.url);
await mkdir(output, { recursive: true });
const crops = [
  ['amazon-thumb', 'amazon-convergence/Kindle-4-1x1.png', {left:225,top:225,width:256,height:232}, 192,174],
  ['amazon-feature', 'amazon-convergence/Kindle-4-1x1.png', {left:240,top:130,width:680,height:340}, 852,426],
  ['vp-thumb', 'vp/VP-HB4H.png', {left:350,top:145,width:320,height:290},192,174],
  ['vp-feature', 'vp/VP.png', {left:335,top:100,width:1260,height:630},852,426],
  ['lotic-thumb', 'lotic/Lotic-insights1.png', {left:320,top:560,width:1056,height:957},192,174],
  ['lotic-feature', 'lotic/Lotic-screens1.jpg', {left:220,top:210,width:1480,height:740},852,426],
];
for (const [name, source, region, width, height] of crops) {
  await sharp(new URL('../src/assets/work/'+source, import.meta.url).pathname)
    .extract(region).resize(width,height).webp({quality:90})
    .toFile(new URL(name+'.webp',output).pathname);
}
