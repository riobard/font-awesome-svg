'use strict';

import fs from 'fs';
import xml2js from 'xml2js';
import svgo from 'svgo';


// Load Unicode/aliases mapping. One Unicode char might have multiple aliases.
function loadAliases() {
  const less = fs.readFileSync('./node_modules/font-awesome/less/variables.less').toString();
  const re = /@fa-var-([a-z-]+):\s*"\\([0-9a-f]+)";/g;
  const m = {}; // id -> [alias0, alias1, alias2, ...]

  let match;
  while (null !== (match = re.exec(less))) {
    const alias = match[1];
    const unicode = String.fromCharCode(parseInt(match[2], 16));

    if (!(unicode in m)) {
      m[unicode] = [];
    }
    m[unicode].push(alias);
  }

  return m;
}


// Extract font metrics and glyph data from SVG font file.
function extract(f) {
  const svgfont = fs.readFileSync('./node_modules/font-awesome/fonts/fontawesome-webfont.svg');
  xml2js.parseString(svgfont, (err, root) => {
    if (err) { throw err; }

    // Read http://www.w3.org/TR/SVG/fonts.html for details
    const units_per_em = (root.svg.defs[0].font[0]['font-face'][0].$['units-per-em']|0) || 1000;
    const ascent = root.svg.defs[0].font[0]['font-face'][0].$.ascent|0;
    const descent = root.svg.defs[0].font[0]['font-face'][0].$.descent|0;
    const horiz_adv_x = root.svg.defs[0].font[0].$['horiz-adv-x']|0;
    const vert_adv_y = (root.svg.defs[0].font[0].$['vert-adv-y']|0) || units_per_em;
    const metrics = {units_per_em, ascent, descent, horiz_adv_x, vert_adv_y};
    const glyphs = root.svg.defs[0].font[0].glyph;
    const aliases = loadAliases();

    for (let g of glyphs) {
      for (let alias of (aliases[g.$.unicode] || [])) {
        f(metrics, {
          id: `fa-${alias}`,
          path: g.$.d,
          width: (g.$['horiz-adv-x']|0) || horiz_adv_x,
          height: (g.$['vert-adv-y']|0) || vert_adv_y,
        });
      }
    }
  });
}


function main() {
  const dir = './svg';
  const color = '#f00';
  const optimize = true;

  try {
    fs.mkdirSync(dir);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }

  extract((metrics, g) => {
    const path = `${dir}/${g.id}.svg`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.width} ${g.height}">
      <g transform="translate(0 ${g.height + metrics.descent}) scale(1 -1)" fill="${color}">
        <path d="${g.path}" />
      </g>
    </svg>`;

    console.log(`Extracting ${path}`);

    if (optimize) {
      (new svgo()).optimize(svg, res => {
        fs.writeFileSync(path, res.data);
      });
    } else {
      fs.writeFileSync(path, svg);
    }
  });
}



main();
