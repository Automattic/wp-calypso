const webpack = require('webpack');
const path = require('path');
const storybookDefaultConfig = require( '@automattic/calypso-storybook' );

module.exports = storybookDefaultConfig({
	plugins: [
		new webpack.ProvidePlugin( {
			process: 'process/browser.js',
		} ),
	],
	babelCacheDirectory: path.join(__dirname, "../../../.cache/babel-storybook")
});
