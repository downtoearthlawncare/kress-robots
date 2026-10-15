// Turns the HTML of Kress's U.S. robotic mower page into a clean list of robots.
// Plain JavaScript with no dependencies, so it runs in Node (GitHub Actions) and
// can be tested anywhere.

var FRACTIONS = { '¼': 0.25, '½': 0.5, '¾': 0.75 };

function findProducts(ld) {
  var products = [];
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === 'object') {
      if (o['@type'] === 'Product') products.push(o);
      Object.keys(o).forEach(function (k) { walk(o[k]); });
    }
  })(ld);
  var seen = {};
  return products.filter(function (p) {
    if (!p.sku || seen[p.sku]) return false;
    seen[p.sku] = true;
    return true;
  });
}

// Each product card on the page has a "price-wrap" block. When a model is on sale,
// the regular price is in "price-excl" and the sale price in "price-discout".
function findPriceBlocks(html) {
  return html.split('class="price-wrap"').slice(1).map(function (seg) {
    seg = seg.slice(0, 3000);
    function num(re) {
      var m = seg.match(re);
      return m ? Number(m[1].replace(/,/g, '')) : null;
    }
    return {
      regular: num(/price-excl[^>]*>\s*(?:&#36;|\$)?\s*([\d,]+\.\d\d)/),
      sale: num(/price-discout[^>]*>\s*(?:&#36;|\$)?\s*([\d,]+\.\d\d)/)
    };
  });
}

function cleanName(name) {
  return name
    .replace(/^Kress\s+/i, '')
    .replace(/®/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\.\s*$/, '')
    .trim();
}

function lineOf(name) {
  if (/Voyager|MasterSeries/i.test(name)) return 'Commercial & Golf';
  if (/EyePilot/i.test(name)) return /4\s*[×x]\s*4/.test(name) ? 'EyePilot 4×4' : 'EyePilot';
  return 'RTKⁿ';
}

function acresOf(name) {
  var m = name.match(/(\d+)\/(\d+)[\s-]*acre/i);
  if (m) return Number(m[1]) / Number(m[2]);
  m = name.match(/(\d+(?:\.\d+)?)?\s*([¼½¾])?[\s-]*acre/i);
  if (m && (m[1] || m[2])) return (m[1] ? Number(m[1]) : 0) + (m[2] ? FRACTIONS[m[2]] : 0);
  return null;
}

function featuresOf(name) {
  var f = [];
  if (/EyePilot/i.test(name)) f.push('Camera vision');
  if (/RTK/i.test(name)) f.push('RTKⁿ satellite navigation');
  if (/4\s*[×x]\s*4/.test(name)) f.push('4×4 drive');
  if (/\bOAS\b/.test(name)) f.push('Obstacle avoidance');
  if (/zero\s*trim/i.test(name)) f.push('ZeroTrim edging');
  if (/\b4G\b/.test(name)) f.push('Built-in 4G');
  if (/Premium Security/i.test(name)) f.push('Premium security');
  if (/V-Wheel/i.test(name)) f.push('Enhanced motor & V-Wheel');
  if (/golf/i.test(name)) f.push('Golf-course grade');
  var w = name.match(/(\d+)''/);
  if (w) f.push(w[1] + '" cutting width');
  return f;
}

function parseKress(html, checkedAt, sourceUrl) {
  var m = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('Could not find product data on the Kress page.');
  var products = findProducts(JSON.parse(m[1]));
  var blocks = findPriceBlocks(html);

  var robots = products.map(function (p, i) {
    var offer = Array.isArray(p.offers) ? p.offers[0] : (p.offers || {});
    var price = Number(offer.price);
    var b = blocks[i];
    // Only trust a "was" price when this block's sale price matches the product's price.
    var wasPrice = (b && b.sale !== null && Math.abs(b.sale - price) < 0.005 && b.regular > price)
      ? b.regular : null;
    return {
      sku: p.sku,
      name: cleanName(p.name || p.sku),
      line: lineOf(p.name || ''),
      acres: acresOf(p.name || ''),
      features: featuresOf(p.name || ''),
      price: isFinite(price) && price > 0 ? price : null,
      wasPrice: wasPrice,
      inStock: /InStock/i.test(offer.availability || ''),
      url: p.url,
      image: Array.isArray(p.image) ? p.image[0] : p.image,
      description: (p.description || '').trim()
    };
  });

  return { source: sourceUrl, checkedAt: checkedAt, count: robots.length, robots: robots };
}

if (typeof module !== 'undefined') module.exports = { parseKress: parseKress };
