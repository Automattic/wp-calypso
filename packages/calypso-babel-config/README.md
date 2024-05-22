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

Example:

```js
module.exports = {
	presets: [
		'@automattic/calypso-babel-config/presets/wordpress-element',
		'@automattic/calypso-babel-config/presets/default',
	],
	plugins: [ 'my-custom-babel-plugin' ],
};
```

The `default` preset has a `modules` option that specifies whether we want to transpile ESM `import` and `export` statements. Most common values are `false`, which keeps these statements intact and results in ES modules as output, and `'commonjs'`, which transpiles the module to the CommonJS format. See the [@babel/preset-env documentation](https://babeljs.io/docs/en/babel-preset-env#modules) for more details.

```js
module.exports = {
	presets: [ [ '@automattic/calypso-babel-config/presets/default', { modules: 'commonjs' } ] ],
};
```

Another way to set the `modules` option is to set the `MODULES` environment variable to `'esm'` (maps to `false`) or any other valid value. That's convenient for running Babel from command line, where specifying options for presets (`--presets=...`) is not supported.

The `default` preset also specifies `corejs`, `debug`, and `useBuiltIns` options that's passed through to [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env#options).
