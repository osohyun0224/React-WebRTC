const { override, addBabelPlugin, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  addBabelPlugin([
    'module-resolver',
    {
      root: ['node_modules/engine.io-parser'],
      alias: {
        'engine.io-parser': 'node_modules/engine.io-parser/build/esm/index.js'
      }
    }
  ]),
  addWebpackAlias({
    'engine.io-parser': path.resolve('node_modules/engine.io-parser/build/esm/index.js')
  })
);
