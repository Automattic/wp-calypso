Calypso SDK
===========

Calypso SDK is an early stage tool that's goal is to build, visualize, test, and deliver extensions from a single source.

## Using SDK CLI

You can link Calypso SDK to be globally available by running `npm link` in the Calypso directory. That will give you a global SDK CLI command:

```
calypso-sdk --help
```

Alternatively, you can run CLI commands directly in Calypso directory:

```
npm run sdk -- --help
```

Note using extra `--` delimiter to pass arguments for the SDK.

## SDK modules

SDK can be extended with modules to perform different tasks. Currently we have only one task; build Gutenberg extensions.

### Gutenberg extensions

SDK module to build [Gutenberg](https://wordpress.org/gutenberg/handbook/) extensions.

See usage instructions:

```
calypso-sdk gutenberg --help
```

Or via NPM script:
```
npm run sdk:gutenberg -- --help
```

## Extending the SDK

CLI API definitions live in `bin/sdk-cli.js` and are constructed using [Yargs](http://yargs.js.org/) library.

Add new modules to SDK by extending the CLI using [`yargs.command`](http://yargs.js.org/docs/#api-commandcmd-desc-builder-handler).

Here is a very basic example to follow:

In `bin/sdk-cli.js`:
```js
const example = require('./sdk/example.js');

yargs.command( {
	command: 'example',
	desc: 'Build example extension',
	builder: yargs =>
		yargs.options( {
			'output-dir': {
				description:
					'Output directory for the built assets. Intermediate directories are created as required.',
				type: 'string',
				coerce: path.resolve,
				requiresArg: true,
			},
		} ),
	handler: argv => build( example, argv ),
} );
```

`bin/sdk/example.js`:
```js
const path = require( 'path' );

exports.config = ( {
	{ argv: { outputDir },
	getBaseConfig,
} ) => {
	const baseConfig = getBaseConfig();
	return {
		...baseConfig,
		...{
			entry: path.resolve( __dirname, '..', 'client', 'example' ),
			output: {
				path: outputDir,
				filename: 'example-build.js',
			},
		},
	};
};
```

This gives you commands:
```bash
calypso-sdk example --help
calypso-sdk example --output-dir=./example
```
