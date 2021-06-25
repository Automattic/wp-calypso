/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );

module.exports = () => {
	return getBaseWebpackConfig(
		{
			WP: true,
		},
		{
			entry: {
				editor: './src/editor.js',
				view: './src/view.js',
			},
		}
	);
};
