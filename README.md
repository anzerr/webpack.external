
### `Intro`
Removes node_modules from webpack bundle.

#### `Install`
``` bash
npm install --save git+https://git@github.com/anzerr/webpack.external.git
```

### `Example`
``` javascript
const externals = require('webpack.external');

module.exports = {
    target: 'node',
    externals: [externals()]
};
```

``` javascript
const externals = require('webpack.external');
externals({
    whitelist: [ // these should be bundled
        '@user/core',
        '@user/domain'
    ],
    modulesRecursive: true // load all node_modules found all the way back to root '/'
})
```