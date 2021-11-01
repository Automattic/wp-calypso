# Webpack RTL Plugin

Webpack plugin to use in addition to [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) to create a second css bundle, processed to be rtl.

This uses [rtlcss](https://github.com/MohammadYounes/rtlcss) under the hood, please refer to its documentation for supported properties.

Originally forked from <https://github.com/romainberger/webpack-rtl-plugin>, commit aca883ad70671a5d2a90c676fe8ea60d42c8759b (tag v2.0.0).

This plugin contains Automattic changes to the original `webpack-rtl-plugin` and is released as `@automattic/webpack-rtl-plugin`.

Check out the [webpack-rtl-example](https://github.com/romainberger/webpack-rtl-example) to see an example of an app using the rtl-css-loader and webpack-rtl-plugin.

## Installation

```shell
$ npm install @automattic/webpack-rtl-plugin
```

## Usage

Add the plugin to your webpack configuration:

```js
const WebpackRTLPlugin = require( '@automattic/webpack-rtl-plugin' );

module.exports = {
	entry: path.join( __dirname, 'src/index.js' ),
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							/*...,*/
						},
					},
				],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin( {
			filename: 'style.css',
		} ),
		new WebpackRTLPlugin(),
	],
};
```

This will create the normal `style.css` and an additionnal `style.rtl.css`.

## Options

```
new WebpackRTLPlugin({
  options: {},
  plugins: [],
  diffOnly: false,
})
```

- `test` a RegExp (object or string) that must match asset filename.
- `options` Options given to `rtlcss`. See the [rtlcss documentation for available options](http://rtlcss.com/learn/usage-guide/options/).
- `plugins` RTLCSS plugins given to `rtlcss`. See the [rtlcss documentation for writing plugins](http://rtlcss.com/learn/extending-rtlcss/writing-a-plugin/). Default to `[]`.
- `diffOnly` If set to `true`, the stylesheet created will only contain the css that differs from the source stylesheet. Default to `false`.
