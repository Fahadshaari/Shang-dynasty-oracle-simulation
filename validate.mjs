// Checks the portable artifact, without installing any packages.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
let assets = 0;
for (const [, target] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  if (/^(?:https?:|data:|#)/.test(target)) continue;
  assert(!target.startsWith('/'), `Root-relative URL will break project Pages: ${target}`);
  assert(fs.existsSync(path.resolve(dist, target.split(/[?#]/)[0])), `Missing asset: ${target}`);
  assets++;
}
for (const file of ['engine.js', 'app.js', 'turtle.js', 'assets/lunar.js']) {
  new Script(fs.readFileSync(path.join(dist, file), 'utf8'), { filename:file });
}
for (const file of ['app.js', 'turtle.js']) {
  const code = fs.readFileSync(path.join(dist, file), 'utf8');
  for (const [, id] of code.matchAll(/\$\('([^']+)'\)/g)) {
    if (id.endsWith('-')) continue; // Prefix for numbered dynamic DOM IDs.
    assert(ids.includes(id), `${file}: missing DOM target ${id}`);
  }
}
assert(!/Math\.random|getRandomValues/.test(fs.readFileSync(path.join(dist, 'turtle.js'), 'utf8')), 'Turtle diagrams must remain deterministic');
console.log(`PASS: JavaScript syntax, ${assets} local asset references, unique DOM IDs and GitHub Pages relative paths.`);
