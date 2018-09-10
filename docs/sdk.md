Calypso SDK
===========

Calypso <abbr title="software development kit">SDK</abbr> is an early stage tool with the goal to build, visualize, test, and deliver interfaces for multiple platforms from a single source.


## Using SDK CLI

```bash
npm run sdk -- --help
```

To build production ready assets, use `NODE_ENV`:
```
NODE_ENV=production npm run sdk -- ...
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

These extensions live under `client/gutenberg/extensions` directory. There are some presets to bundle multiple extensions into one in `client/gutenberg/extensions/presets` directory.

By default, these extensions will be built under `build` folder in the same folder with entry script.

## Extending the SDK

Adding new build targets for the SDK is straightforward but should be done with some consideration. Keeping the SDK as generic as possible is essential, and thus this isn't a place to create a new config for every project. Preferably this is a place to create configurations for entirely separate classes of projects.

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
	calypsoRoot,
} ) => {
	const baseConfig = getBaseConfig();
	return {
		...baseConfig,
		entry: path.join( calypsoRoot, 'client', 'example' ),
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
