<!-- @format -->

# Calypso SDK

Calypso <abbr title="software development kit">SDK</abbr> is an early stage tool with the goal to build, visualize, test, and deliver interfaces for multiple platforms from a single source.

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

### Gutenberg extensions

SDK module to build [Gutenberg](https://wordpress.org/gutenberg/handbook/) extensions.

See usage instructions:

```bash
npm run sdk -- gutenberg --help
```

These extensions live under `client/gutenberg/extensions` directory. There are some presets to bundle multiple extensions into one in `client/gutenberg/extensions/presets` directory.

By default, these extensions will be built under `build` folder in the same folder with entry script.

Some dependencies will be omitted from the bundle using webpack externals. They are expected to be
present in the environment where the produced scripts are run.

- @wordpress/\* dependencies
- lodash

The produced bundles expect these scripts to be available in the global scope when run, i.e.
`window.lodash`.

Read more from [Gutenberg extension docs](../client/gutenberg/extensions/README.md).

#### Gutenberg extensions presets

Presets are bundles of multiple extensions or blocks that live in a particular plugin.
They can be found in `client/gutenberg/extensions/presets` directory.

To create a new preset, create a new folder in that directory and add an `index.json` file.
The file should be an object of arrays of the extensions folder names that you want to bundle together
for different environments.

```js
{
  "production": [
    "contact-form",
    "map",
    "markdown",
    "publicize",
    "simple-payments"
  ],
  "beta": [
    "related-posts",
    "tiled-gallery",
    "vr"
  ]
}
```

When you run the sdk command `npm run sdk -- gutenberg client/gutenberg/extensions/presets/your-new-preset`
You will end up with something like this.

```
editor.js
editor.css
editot.rtl.css
tiled-gallery/view.js
tiled-gallery/view.css
tiled-gallery/view.rtl.css
```

Note the individual folders get created for each of the extensions only if they contain
a view.js file. (In this case markdown only has a editor.js file) Also the `editor` (js and css) file
also contains the code present for the frontend (js and css) files so you don't need to load both files.

If the preset contains a `/editor-shared` directory the shared files will also be
bundled into the editor (js and css).

If the preset contains a `/shared` directory the shared files will also be bundled
into the editor (js and css) as well as the individual blocks view (js and css) bundles.

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
