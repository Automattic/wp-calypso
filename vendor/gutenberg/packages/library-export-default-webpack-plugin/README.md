# @wordpress/library-export-default-webpack-plugin

Webpack plugin for exporting default property for selected libraries. Implementation is based on the Webpack's core plugin [ExportPropertyMainTemplatePlugin](https://github.com/webpack/webpack/blob/51b0df77e4f366163730ee465f01458bfad81f34/lib/ExportPropertyMainTemplatePlugin.js). The only difference is that this plugin allows to whitelist all entry point names where the default export of your entry point will be assigned to the library target.  

**Note**: This plugin targets Webpack 4.0 and newer, and is not compatible with older versions.

## Installation

Install the module

```bash
npm install @wordpress/library-export-default-webpack-plugin --save
```

## Usage

Construct an instance of `LibraryExportDefaultPlugin` in your Webpack configurations plugins entry, passing an array where values correspond to the entry point name.

The following example selects `boo` entry point to be updated by the plugin. When compiled, the built file will ensure that `default` value exported for the chunk will be assigned to the global variable `wp.boo`. `foo` chunk will remain untouched.

```js
const LibraryExportDefaultPlugin = require( '@wordpress/library-export-default-webpack-plugin' );

module.exports = {
	// ...

	entry: {
		boo: './packages/boo',
		foo: './packages/foo',
	},
	
	output: {
		filename: 'build/[name].js',
		path: __dirname,
		library: [ 'wp', '[name]' ],
		libraryTarget: 'this',
	},

	plugins: [
		new LibraryExportDefaultPlugin( [ 'boo' ] ),
	],
}
```

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
