Calypso SDK
===========

Calypso SDK is an early stage tool that's goal is to build, visualize, test, and deliver extensions from a single source.

## Using SDK CLI

```bash
npm run sdk -- --help
```

Note: It's also possible to run the SDK command "globally" by linking within the Calypso repository with [`npm link`](https://docs.npmjs.com/cli/link). After running this command you can replace all invocations of `npm run sdk --` in the examples below with `calypso-sdk` and may do so from any other directory in the filesystem:
```
calypso-sdk --help
```

## SDK modules

SDK can be extended with modules to perform different tasks. Currently we have only one task; build Gutenberg extensions.

### Gutenberg extensions

SDK module to build [Gutenberg](https://wordpress.org/gutenberg/handbook/) extensions.

See usage instructions:

```
npm run sdk -- gutenberg --help
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
		entry: path.resolve( __dirname, '..', 'client', 'example' ),
		output: {
			path: outputDir,
			filename: 'example-build.js',
		},
	};
};
```

This gives you commands:
```bash
npm run sdk -- example --help
npm run sdk -- example --output-dir=./example
```
