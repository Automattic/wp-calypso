/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const path = require( 'path' );

module.exports = getBaseWebpackConfig( null, {
	entry: {
		server: path.join( __dirname, 'src', 'server' ),
	},
	'output-path': path.join( __dirname, 'dist' ),
} );
