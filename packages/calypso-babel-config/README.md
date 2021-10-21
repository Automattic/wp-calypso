# @automattic/calypso-babel-config

## Config

This package exports the configuration used for Calypso projects in `./babel.config.js`. It is recommended to have your own `babel.config.js` in the root of the project and extend from this one. Example:

```js
const { babelConfig } = require( '@automattic/calypso-babel-config' );
module.exports = babelConfig();
```

It supports a few configuration options:

- `isBrowser`: boolean, whether the config is meant to be used in a Browser or in Node.js.
- `outputPOT`: string, path to store the .POT files with the translations

Example (with default values):

```js
const { babelConfig } = require( '@automattic/calypso-babel-config' );
module.exports = babelConfig( {
	isBrowser: true,
	outputPOT: './build',
} );
```

## Presets

It exports three presets:

- `presets/default`: default preset used in Calypso
- `presets/dependencies`: used to transpile selected NPM dependencies from ESnext to the target's ES version.
- `presets/wordpress-element`: used to transpile code for Wordpress
