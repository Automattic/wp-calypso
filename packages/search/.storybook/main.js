const webpack = require( 'webpack' );
const path = require( 'path' );
const storybookDefaultConfig = require( '@automattic/calypso-storybook' );

module.exports = {
	...storybookDefaultConfig( {
		plugins: [
			new webpack.ProvidePlugin( {
				process: 'process/browser.js',
			} ),
		],
	} ),
};
