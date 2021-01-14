/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const { readdirSync } = require( 'fs' );
const packageFile = require( './package.json' );

const FSE_MODULE_PREFIX = 'a8c-fse';

/**
 * Internal variables
 */
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Returns the "entry" section of the webpack config.
 *
 * 1. Includes all top-level directories from 'full-site-editing-plugin' which
 *    contain an index.js or index.ts file.
 * 2. Excludes any sources which are in the package.json exclude list.
 * 3. Includes additional source paths from package.json
 *
 * @returns {Object<string,string>} A dictionary of source names to source paths.
 */
function getWebpackEntry() {
	// Modules which are imported by other modules and do not need compiled themselves.
	const detectedSources = readdirSync( 'editing-toolkit-plugin', { withFileTypes: true } )
		.filter(
			( dir ) =>
				dir.isDirectory() &&
				! packageFile.excludedSources.includes( dir.name ) &&
				readdirSync( path.join( 'editing-toolkit-plugin', dir.name ) ).some(
					( file ) => file === 'index.ts' || file === 'index.js'
				)
		)
		.map( ( dir ) => dir.name );

	const sources = [ ...detectedSources, ...packageFile.additionalSources ];

	return sources.reduce( ( acc, source ) => {
		const sourceName = path.basename( source );
		acc[ sourceName ] = path.join( __dirname, 'editing-toolkit-plugin', source );
		return acc;
	}, {} );
}

/**
 * Return a webpack config object
 *
 * Arguments to this function replicate webpack's so this config can be used on
 * the command line, with individual options overridden by command line args.
 *
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 *
 * @param   {object}  env                           environment options
 * @param   {object}  argv                          options map
 * @param   {string}  argv.entry                    entry path
 * @returns {object}                                webpack config
 */
function getWebpackConfig( env = {}, argv = {} ) {
	env.WP = true;
	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		entry: getWebpackEntry(),
		output: {
			...webpackConfig.output,
			path: path.join( __dirname, 'editing-toolkit-plugin', 'dist' ),
			filename: '[name].js', // dynamic filename
		},
		plugins: [
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new webpack.DefinePlugin( {
				__i18n_text_domain__: JSON.stringify( 'full-site-editing' ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill: true,
				requestToExternal( request ) {
					if ( request.startsWith( FSE_MODULE_PREFIX ) ) {
						switch ( request ) {
							// This is not a real module, it is a placeholder that corresponds to a WordPress script handle registered with the same name.
							// This allows us to import the module, declaring the dependency via JavaScript.
							// A TypeScript type helps ensure it's used properly. See `./typings/fse`
							case 'a8c-fse-common-data-stores':
								return request;

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
