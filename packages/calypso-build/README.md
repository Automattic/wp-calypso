# Calypso Build Tools

This package is a set of configuration files and scripts that allow for simple building of projects based on modern versions of JavaScript (ESNext and JSX) and SASS. It is meant to somewhat standardize the "dialect" of JavaScript that is used across Automattic's products, and to remove maintenance burden from individual contributors by providing a unified build toolset. It is hoped to be of use to the wider WordPress and JavaScript communities as well.

## Features

`calypso-build` supports ESNext/JSX transpilation out of the box, as well as bundling of SASS files imported through `@import style.scss` statements, and automatic generation of RTL versions of those style files.

It is designed in a way that in its simplest form is very easy to invoke, with very little configuration overhead, yet can be customized in a more fine-grained way as a project's needs evolve.

## Usage

Add add `@automattic/calypso-build` to your project's `devDependencies` by running

```
yarn add --dev @automattic/calypso-build
```

Then, add a `build` script that invokes the `calypso-build` command:

```json
	"scripts": {
		"build": "calypso-build ./src/editor.js"
	}
```

Simple as that -- the only argument you really need to pass to `calypso-build` is an entry point file for your project. By default, this will create a `dist/` subfolder in your current working directory that will contain the built files -- typically one `.js`, one `.css`, and one `.rtl.css` file.

### `--output-path`

If you want your built files to go elsewhere, you can customize the output path as follows:

```json
	"scripts": {
		"build": "calypso-build --output-path='./build' ./src/editor.js"
	}
```

### Multiple entry points

It's also possible to define more than one entry point (resulting in one bundle per entry point):

```json
	"scripts": {
		"build": "calypso-build --output-path='./build' editor=./src/editor.js view=./src/view.js"
	}
```

### Command Line Interface based on Webpack's

If you have some experience with Webpack, the format of these [command line options will seem familiar](https://webpack.js.org/api/cli/) to you. In fact, `calypso-build` is a a thin wrapper around Webpack's Command Line Interface (CLI) tool, pointing it to the `webpack.config.js` file that ships with `@automattic/calypso-build`.

It was our conscious decision to stick to Webpack's interface rather than covering it up with our own abstraction, since the build tool doesn't really add any conceptually different functionality, and our previous SDK approach showed that we ended up replicating features readily provided by Webpack anyway.

### `--env.WP` option to automatically compute dependencies, and transpile JSX to `@wordpress/element`

That `webpack.config.js` introduces one rather WordPress/Gutenberg specific "environment" option, `WP`, which you can set as follows:

```json
	"scripts": {
		"build": "calypso-build ./src/editor.js --env.WP"
	}
```

The impact of this option is twofold:

1. It will make Webpack use `@wordpress/dependency-extraction-webpack-plugin` to infer NPM packages that are commonly used by Gutenberg blocks (anything in the `@wordpress/` scope, `lodash`, React, jQuery, etc) from the source files it bundles, and produce a `.asset.php` file containing an array of those dependencies for use with `wp_enqueue_script`. For more information, see `@wordpress/dependency-extraction-webpack-plugin`'s [docs](https://developer.wordpress.org/block-editor/packages/packages-dependency-extraction-webpack-plugin/).

2. It will transpile JSX to [`@wordpress/element`](https://www.npmjs.com/package/@wordpress/element) rather than React components. This is also required for Gutenberg blocks.

## Advanced Usage: Use own Webpack Config

If you find that the command line options provided by the `calypso-build` tool do not cut it for your project (e.g. if you need to run other Webpack loaders or plugins), you can use your own `webpack.config.js` file to extend the one provided by `@automattic/calypso-build`. The latter exports a [function](https://webpack.js.org/configuration/configuration-types#exporting-a-function) that can be called from your config file, allowing you to extend the resulting object:

```js
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );

function getWebpackConfig( env, argv ) {
	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		plugins: [
			...webpackConfig.plugins,
			new CopyWebpackPlugin( [
				{
					from: 'src/index.json',
					to: 'index.json',
				},
			] ),
		],
	};
}

module.exports = getWebpackConfig;
```

`calypso-build` will automatically pick up your `webpack.config.js` if it's in the same directory that the command is called from. You can customize that filename and location using the `--config` option:

```json
	"scripts": {
		"build": "calypso-build --config='./config-files/webpack.config.js' ./src/editor.js"
	}
```

## Advanced Usage: Use own Babel Config

It is also possible to customize how Babel transpiles a project. Simply add a `babel.config.js` to your project's root (i.e. the location you call `yarn run build` from), and the build tool will pick it up over its own `babel.config.js` to transpile your project.

To extend the default behavior provided by `@automattic/calypso-build`, you can use presets found in its `babel/` directory, and add your own presets and/or plugins, e.g.

```js
module.exports = {
	presets: [
		'@automattic/calypso-build/babel/wordpress-element',
		'@automattic/calypso-build/babel/default',
	],
	plugins: [ 'my-custom-babel-plugin' ],
};
```

The `default` preset has a `modules` option that specifies whether we want to transpile ESM `import` and `export` statements. Most common values are `false`, which keeps these statements intact and results in ES modules as output, and `'commonjs'`, which transpiles the module to the CommonJS format. See the [@babel/preset-env documentation](https://babeljs.io/docs/en/babel-preset-env#modules) for more details.

```js
presets: [ [ '@automattic/calypso-build/babel/default', { modules: 'commonjs' } ] ];
```

Another way to set the `modules` option is to set the `MODULES` environment variable to `'esm'` (maps to `false`) or any other valid value. That's convenient for running Babel from command line, where specifying options for presets (`--presets=...`) is not supported.

## Advanced Usage: Use own PostCSS Config

You can also customize how PostCSS transforms your project's style files by adding a `postcss.config.js` to it.

For example, the following `postcss.config.js` will use color definitions from `@automattic/calypso-color-schemes` by setting CSS variables, and add 'polyfills' for browsers like IE11:

```js
module.exports = () => ( {
	plugins: {
		'postcss-custom-properties': {
			importFrom: [ require.resolve( '@automattic/calypso-color-schemes' ) ],
		},
		autoprefixer: {},
	},
} );
```

## Jest

Use the provided Jest configuration via a preset. In your `jest.config.js` set the following:

```js
module.exports = {
	preset: '@automattic/calypso-build',
};
```
