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
 * Internal variables
 */
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Return a webpack config object
 *
 * Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 *
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 *
 * @param  {object}  env                           environment options
 * @param  {object}  argv                          options map
 * @param  {object}  argv.source                   "plugin" or "theme"
 * @return {object}                                webpack config
 */
function getWebpackConfig( env = {}, argv = {} ) {
	env.WP = true;

	if ( 'theme' === argv.source ) {
		argv.entry = path.join( __dirname, 'blank-theme' );
		argv[ 'output-path' ] = path.join( __dirname, 'dist', 'blank-theme' );
		argv[ 'output-filename' ] = 'blank-theme.js';
	} else {
		argv.entry = path.join( __dirname, 'full-site-editing-plugin' );
		argv[ 'output-path' ] = path.join( __dirname, 'dist', 'full-site-editing-plugin' );
		argv[ 'output-filename' ] = 'full-site-editing-plugin.js';
	}

	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		watch: isDevelopment,
		devtool: isDevelopment ? 'inline-cheap-source-map' : false,
	};
}

module.exports = getWebpackConfig;
