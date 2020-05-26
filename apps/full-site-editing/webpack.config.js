/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const _ = require( 'lodash' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
// eslint-disable-next-line import/no-extraneous-dependencies
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const path = require( 'path' );

const FSE_MODULE_PREFIX = 'a8c-fse';

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

	// object provides ability to name the entry point
	// which enables dynamic file names
	const sources = _.castArray( argv.source );

	// Output path
	let packageName;
	const entry = sources.reduce( ( accumulator, source ) => {
		const sourceSegments = source.split( path.sep );
		const scriptName =
			sourceSegments.length > 1 ? sourceSegments.slice( 1 ).join( path.sep ) : source;

		// All outputs from a particular package must share an output path.
		const sourcePackage = sourceSegments[ 0 ];
		if ( packageName && packageName !== sourceSegments[ 0 ] ) {
			throw new Error( 'FSE can build multiple sources for a single package.' );
		}
		packageName = sourcePackage;

		accumulator[ scriptName ] = path.join( __dirname, 'full-site-editing-plugin', source );
		return accumulator;
	}, {} );

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
		plugins: [
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill: true,
				requestToExternal( request ) {
					if ( request.startsWith( FSE_MODULE_PREFIX ) ) {
						switch ( request ) {
							case 'a8c-fse-common-data-stores':
								return [ 'wpcomFse', 'data-stores' ];
							default:
								throw new Error( `Received unknown module request ${ request }.` );
						}
					}
				},
			} ),
		],
		watch: isDevelopment,
		devtool: isDevelopment ? 'inline-cheap-source-map' : false,
		stats: 'minimal',
	};
}

module.exports = getWebpackConfig;
