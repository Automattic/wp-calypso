/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
// eslint-disable-next-line import/no-extraneous-dependencies
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
 * @param   {object}  env                           environment options
 * @param   {object}  argv                          options map
 * @param   {string}  argv.source                   plugin slug
 * @param   {string}  argv.entry                    entry path
 * @returns {object}                                webpack config
 */
function getWebpackConfig( env = {}, argv = {} ) {
	env.WP = true;

	const source = argv.source;
	const sourceSegments = source.split( path.sep );
	const packageName = sourceSegments[ 0 ];
	const scriptName =
		sourceSegments.length > 1 ? sourceSegments.slice( 1 ).join( path.sep ) : source;

	// object provides ability to name the entry point
	// which enables dynamic file names
	const entry = {
		[ scriptName ]: path.join( __dirname, 'full-site-editing-plugin', source ),
	};

	const outputPath = path.join( __dirname, 'full-site-editing-plugin', packageName, 'dist' );

	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		entry,
		output: {
			...webpackConfig.output,
			path: outputPath,
			filename: '[name].js', // dynamic filename
		},
		watch: isDevelopment,
		devtool: isDevelopment ? 'inline-cheap-source-map' : false,
		stats: 'minimal',
	};
}

module.exports = getWebpackConfig;
