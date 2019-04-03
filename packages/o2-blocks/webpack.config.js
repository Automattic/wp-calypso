/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const path = require( 'path' );

/**
 * Return a webpack config object
 *
 * @return {object} webpack config
 */
function getWebpackConfig() {
	const editorScript = path.join( __dirname, 'src', 'editor.js' );
	const viewScript = path.join( __dirname, 'src', 'view.js' );
	const viewScriptEntry = fs.existsSync( viewScript ) ? { view: viewScript } : {};

	return getBaseWebpackConfig( null, {
		entry: {
			editor: editorScript,
			...viewScriptEntry,
		},
		'output-path': path.join( __dirname, 'dist' ),
	} );
}

module.exports = getWebpackConfig;
