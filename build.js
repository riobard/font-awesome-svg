'use strict';

import fs from 'fs';
import xml2js from 'xml2js';
import svgo from 'svgo';


// Load Unicode/aliases mapping. One Unicode char might have multiple aliases.
function loadAliases() {
  const less = fs.readFileSync(require.resolve('font-awesome/less/variables.less')).toString();
  const re = /@fa-var-([a-z0-9-]+)\s*:\s*"\\([0-9a-f]+)";/g;
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
  const svgfont = fs.readFileSync(require.resolve('font-awesome/fonts/fontawesome-webfont.svg'));
  xml2js.parseString(svgfont, (err, root) => {
    if (err) { throw err; }

    // Read http://www.w3.org/TR/SVG/fonts.html for details
    const font = root.svg.defs[0].font[0];
    const fontface = font['font-face'][0];
    const units = (fontface.$['units-per-em']|0) || 1000;
    const ascent = fontface.$.ascent|0; // or units - voy if unset
    const descent = fontface.$.descent|0; // or voy if unset
    const hox = font.$['horiz-origin-x']|0;
    const hoy = font.$['horiz-origin-y']|0;
    const hdx = font.$['horiz-adv-x']|0;
    const vox = (font.$['vert-origin-x']|0) || (hdx/2);
    const voy = (font.$['vert-origin-y']|0) || ascent;
    const vdy = (font.$['vert-adv-y']|0) || units;
    const metrics = {units, ascent, descent, hox, hoy, hdx, vox, voy, vdy};
    const glyphs = font.glyph;
    const aliases = loadAliases();

    for (let g of glyphs) {
      for (let alias of (aliases[g.$.unicode] || [])) {
        f(metrics, {
          id: `fa-${alias}`,
          path: g.$.d,
          width: (g.$['horiz-adv-x']|0) || hdx,
          height: (g.$['vert-adv-y']|0) || vdy,
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
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${metrics.hox} ${metrics.hoy} ${g.width} ${g.height}">
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
