#!/usr/bin/env node


"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = splitSVG;

var fs = _interopRequire(require("fs"));

var svgfont2js = _interopRequire(require("svgfont2js"));

var mkdirpSync = require("mkdirp").sync;

var minimist = _interopRequire(require("minimist"));

function loadAliases(less) {
  var re = /@fa-var-([a-z0-9-]+)\s*:\s*"\\([0-9a-f]+)";/g;
  var m = {}; // unicode hex -> [alias0, alias1, alias2, ...]

  var match = undefined;
  while (null !== (match = re.exec(less))) {
    var alias = match[1];
    var unicode_hex = match[2];

    if (!(unicode_hex in m)) {
      m[unicode_hex] = [];
    }
    m[unicode_hex].push(alias);
  }

  return m;
}

function splitSVG(dir) {
  var color = arguments[1] === undefined ? "#000" : arguments[1];
  var verbose = arguments[2] === undefined ? false : arguments[2];

  var aliases = loadAliases(fs.readFileSync(require.resolve("font-awesome/less/variables.less", "utf8")));
  var glyphs = svgfont2js(fs.readFileSync(require.resolve("font-awesome/fonts/fontawesome-webfont.svg", "utf8")));

  mkdirpSync(dir);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = glyphs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var g = _step.value;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (aliases[g.unicode_hex] || [])[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var alias = _step2.value;

          var path = "" + dir + "/fa-" + alias + ".svg";
          var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\" viewBox=\"0 0 " + g.width + " " + g.height + "\"><path fill=\"" + color + "\" d=\"" + g.path + "\" /></svg>";
          fs.writeFileSync(path, svg);

          if (verbose) {
            console.log("Extracted " + path);
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"]) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function run() {
  var args = minimist(process.argv.slice(2));
  var usage = "Usage: " + process.argv[1] + " --dir OUTPUT_DIR [--color '#000'] [--verbose]";

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

