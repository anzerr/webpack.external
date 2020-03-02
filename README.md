
### `Intro`
// explain

#### `Install`
``` bash
npm install --save git+https://git@github.com/anzerr/webpack.external.git
```

### `Example`
``` javascript
const externals = require('webpack.external');
...
module.exports = {
    ...
    target: 'node',
    externals: [externals()],
    ...
};
```