# Calypso SDK build tool

Calypso <abbr title="software development kit">SDK</abbr> build tool is an early stage tool with the goal to build, visualize, test, and deliver interfaces for multiple platforms from a single source.

It basically takes parts of Calypso Webpack config uses it to build asset bundles that can be used outside Calypso.

## Using SDK CLI

```bash
npm run sdk -- --help
```

To build production ready assets, use `NODE_ENV`:

```
NODE_ENV=production npm run sdk -- ...
```

To include source maps:
```
SOURCEMAP='source-map' npm run sdk -- ...
```

Note: It's also possible to run the SDK command "globally" by linking within the Calypso repository with [`npm link`](https://docs.npmjs.com/cli/link). After running this command you can replace all invocations of `npm run sdk --` in the examples below with `calypso-sdk` and may do so from any other directory in the filesystem:

```bash
calypso-sdk --help
```

## SDK modules

SDK can be extended with modules to perform different tasks. Currently we have two tasks; build Gutenberg extensions and Notifications client.

### Notifications

SDK module to build standalone notifications client.

See usage instructions:

```bash
npm run sdk -- notifications --help
```

Read more from [Notifications docs](../client/notifications/README.md).

### Generic JavaScript builds

SDK module to build independent no-config JavaScript projects.
Use for quick prototyping or one-off builds.
Each built bundle is limited to a single bundle with no code-splitting.
If you find yourself needing more advanced functionality it's probably worth checking if a new module is warranted.

See usage instructions:

```bash
npm run sdk -- generic /path/to/entry-point.js /path/to/built-bundle.js
```

Many projects will be injected into a WordPress environment where the `wp` global variable holds WordPress-specific functionality.
These WordPress dependencies (the `@wordpress/…` packages) are loaded through PHP.
When building in these environments tell the SDK to rely on the global values so that it won't add them into the built bundle.

```bash
npm run sdk -- generic --global-wp /path/to/entry-point.js /path/to/built-bundle.js
```

## Extending the SDK

Adding new build targets for the SDK is straightforward but should be done with some consideration. Keeping the SDK as generic as possible is essential, and thus this isn't a place to create a new config for every project. Preferably this is a place to create configurations for entirely separate classes of projects.

CLI API definitions live in `bin/sdk-cli.js` and are constructed using [Yargs](http://yargs.js.org/) library.

Add new modules to SDK by extending the CLI using [`yargs.command`](http://yargs.js.org/docs/#api-commandcmd-desc-builder-handler).

Here is a very basic example to follow:

In `bin/sdk-cli.js`:

```js
const example = require( './sdk/example.js' );

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
