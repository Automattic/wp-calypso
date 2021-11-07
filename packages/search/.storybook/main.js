const storybookDefaultConfig = require( '../../../bin/storybook-default-config' );
const webpack = require('webpack');

module.exports = storybookDefaultConfig({
	plugins: [
		new webpack.ProvidePlugin( {
			process: 'process/browser.js',
		} ),
	]
});
