const path = require('path');
const { override, babelInclude } = require('react-app-rewired');

module.exports = override(
    babelInclude([
        path.resolve('src'), // Make sure you link your own source
        path.resolve('node_modules/engine.io-parser'), // Add the package here
    ]),
);