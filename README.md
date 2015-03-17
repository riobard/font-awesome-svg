# font-awesome-svg

Split [Font Awesome](http://fortawesome.github.io/Font-Awesome/) icons into
individual SVG files.



## Installation

```sh
npm install -g font-awesome-svg
```



## CLI Usage


```sh
fa2svg --dir OUTPUT_DIR [--color '#000' ] [--verbose]
```


## API Usage


```JavaScript
var fa2svg = require('font-awesome-svg');
var dir = 'fa-svg';
var color = '#fff';
ver verbose = true;
fa2svg(dir, color, verbose);
```



## Development


Transpile source code from ES6 to ES5 for distribution.


```sh
npm run build
```
