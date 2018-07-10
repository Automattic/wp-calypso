# Custom Templated Path Webpack Plugin

Webpack plugin for creating custom path template tags. Extend the [default set of template tags](https://webpack.js.org/configuration/output/#output-filename) with your own custom behavior. Hooks into Webpack's compilation process to allow you to replace tags with a substitute value.

**Note:** This plugin targets Webpack 4.0 and newer, and is not compatible with older versions.

## Usage

Construct an instance of `CustomTemplatedPathPlugin` in your Webpack configurations `plugins` entry, passing an object where keys correspond to the template tag name. The value for each key is a function passed the original intended path and data corresponding to the asset.

The following example creates a new `basename` tag to substitute the basename of each entry file in the build output file. When compiled, the built file will be output as `build-entry.js`.

```js
const { basename } = require( 'path' );
const CustomTemplatedPathPlugin = require( '@wordpress/custom-templated-path-webpack-plugin' );

module.exports = {
	// ...
	
	entry: './entry',

	output: {
		filename: 'build-[basename].js',
	},

	plugins: [
		new CustomTemplatedPathPlugin( {
			basename( path, data ) {
				let rawRequest;

				const entryModule = get( data, [ 'chunk', 'entryModule' ], {} );
				switch ( entryModule.type ) {
					case 'javascript/auto':
						rawRequest = entryModule.rawRequest;
						break;

					case 'javascript/esm':
						rawRequest = entryModule.rootModule.rawRequest;
						break;
				}

				if ( rawRequest ) {
					return basename( rawRequest );
				}

				return path;
			},
		} ),
	],
};
```

For more examples, refer to Webpack's own [`TemplatedPathPlugin.js`](https://github.com/webpack/webpack/blob/v4.1.1/lib/TemplatedPathPlugin.js), which implements the base set of template tags.
