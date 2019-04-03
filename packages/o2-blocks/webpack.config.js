/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const path = require( 'path' );

/**
 * Return a webpack config object
 *
 * @return {object} webpack config
 */
function getWebpackConfig() {
	return getBaseWebpackConfig( null, {
		entry: {
			editor: path.join( __dirname, 'src', 'editor.js' ),
		},
		'output-path': path.join( __dirname, 'dist' ),
	} );
}

module.exports = getWebpackConfig;
