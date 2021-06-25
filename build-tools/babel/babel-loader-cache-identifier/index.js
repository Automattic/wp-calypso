/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Given a module name, returns the package version
 *
 * @param  {string} id Module name
 * @returns {string}    Module version
 */
function getModuleVersion( id ) {
	return require( id + '/package.json' ).version;
}

/**
 * Cache identifier string for use with babel-loader. This is an extension of
 * the default cacheIdentifier, including package version from our custom Babel
 * transform plugin to ensure proper cachebusting.
 *
 * @see https://github.com/babel/babel-loader/blob/501d60d/src/index.js#L85-L92
 * @type {string}
 */
module.exports = JSON.stringify( {
	'babel-loader': getModuleVersion( 'babel-loader' ),
	'babel-core': getModuleVersion( '@babel/core' ),
	'babel-plugin-transform-wpcalypso-async': getModuleVersion(
		'@automattic/babel-plugin-transform-wpcalypso-async'
	),
	babelrc: fs.readFileSync( path.resolve( __dirname, '../../../babel.config.js' ), 'utf8' ),
	env: process.env.BABEL_ENV || process.env.NODE_ENV,
} );
