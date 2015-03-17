#!/usr/bin/env node

'use strict';

import fs from 'fs';
import svgfont2js from 'svgfont2js';
import {sync as mkdirpSync} from 'mkdirp';
import minimist from 'minimist';


function loadAliases(less) {
  const re = /@fa-var-([a-z0-9-]+)\s*:\s*"\\([0-9a-f]+)";/g;
  const m = {}; // unicode hex -> [alias0, alias1, alias2, ...]

  let match;
  while (null !== (match = re.exec(less))) {
    const alias = match[1];
    const unicode_hex = match[2];

    if (!(unicode_hex in m)) {
      m[unicode_hex] = [];
    }
    m[unicode_hex].push(alias);
  }

  return m;
}



export default function splitSVG(dir, color = '#000', verbose = false) {
  const aliases = loadAliases(fs.readFileSync(require.resolve('font-awesome/less/variables.less', 'utf8')));
  const glyphs = svgfont2js(fs.readFileSync(require.resolve('font-awesome/fonts/fontawesome-webfont.svg', 'utf8')));

  mkdirpSync(dir);

  for (let g of glyphs) {
    for (let alias of (aliases[g.unicode_hex] || [])) {
      const path = `${dir}/fa-${alias}.svg`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${g.width} ${g.height}"><path fill="${color}" d="${g.path}" /></svg>`;
      fs.writeFileSync(path, svg);

      if (verbose) {
        console.log(`Extracted ${path}`);
      }
    }
  }
}


function run() {
  const args = minimist(process.argv.slice(2));
  const usage = `Usage: ${process.argv[1]} --dir OUTPUT_DIR [--color '#000'] [--verbose]`;

  if (args.help || args.h) {
    console.log(usage);
    return;
  }

  if (!args.dir) {
    console.log(usage);
    return;
  }

  splitSVG(args.dir || args.d, args.color || args.c, args.verbose || args.v);
}


if (require.main === module) {
  run();
}
