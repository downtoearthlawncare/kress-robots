// Daily job: download Kress's robotic mower page and save the models and prices
// to data/robots.json. If anything looks wrong, it stops and keeps yesterday's file,
// so the website never shows a broken or empty list.

const fs = require('fs');
const path = require('path');
const { parseKress } = require('./parse-kress.js');

const SOURCE = 'https://www.kress.com/en-us/robotic-lawn-mowers/';
const OUT = path.join(__dirname, '..', 'data', 'robots.json');
const MIN_MODELS = 8;

async function main() {
  const res = await fetch(SOURCE, {
    headers: { 'User-Agent': 'DownToEarthLawnCare-KressSync/1.0 (+https://downtoearthlawncareia.com)' }
  });
  if (!res.ok) throw new Error(`Kress page returned HTTP ${res.status}`);

  const now = new Date().toISOString();
  const data = parseKress(await res.text(), now, SOURCE);

  const priced = data.robots.filter(r => r.price);
  if (priced.length < MIN_MODELS) {
    throw new Error(`Only found ${priced.length} priced models (expected at least ${MIN_MODELS}). Keeping the previous data.`);
  }

  let previous = null;
  try { previous = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (e) { /* first run */ }
  const changed = !previous || JSON.stringify(previous.robots) !== JSON.stringify(data.robots);
  data.updatedAt = changed ? now : (previous.updatedAt || now);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
  console.log(`${data.count} models saved. ${changed ? 'Prices or models changed.' : 'No changes since last check.'}`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
