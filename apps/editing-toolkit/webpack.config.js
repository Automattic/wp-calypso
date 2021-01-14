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
	const webpackConfig = getBaseWebpackConfig( env, argv );
	const baseConfig = {
		...webpackConfig,
		output: {
			...webpackConfig.output,
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

	// Modules which are imported by other modules and do not need compiled themselves.
	const EXCLUDED_MODULES = [ 'e2e-test-helpers', 'block-helpers' ];
	const sources = readdirSync( 'editing-toolkit-plugin', { withFileTypes: true } )
		.filter(
			( dir ) =>
				dir.isDirectory() &&
				! EXCLUDED_MODULES.includes( dir.name ) &&
				readdirSync( path.join( 'editing-toolkit-plugin', dir.name ) ).some(
					( file ) => file === 'index.ts' || file === 'index.js'
				)
		)
		.map( ( dir ) => dir.name );

	// TODO: Since we parse the sources inline above, this really doesn't do anything.
	// We still need to add support for common/data-stores, and other "same-package" scripts.

	// Group sources by their root path.
	const packageSources = sources.reduce( ( accumulator, source ) => {
		const sourceSegments = source.split( path.sep );
		// Basically, given 'package/path/to/script', returns 'package'.
		const packageName = sourceSegments[ 0 ];
		// Basically, given 'package/path/to/script', returns 'path/to/script'. It removes the "package" part of the path.
		const scriptName =
			sourceSegments.length > 1 ? sourceSegments.slice( 1 ).join( path.sep ) : source;

		// Group scripts in the same package together.
		if ( ! accumulator[ packageName ] ) {
			accumulator[ packageName ] = {};
		}

		accumulator[ packageName ][ scriptName ] = path.join(
			__dirname,
			'editing-toolkit-plugin',
			source
		);
		return accumulator;
	}, {} );

	// Each package requires a different webpack config because each package requires
	// its own output path. So we return an array of webpack configs, one for each
	// package, based on a similar root. The only real difference is "entry" and "output".
	return Object.keys( packageSources ).map( ( packageName ) => {
		const entry = packageSources[ packageName ];
		const outputPath = path.join( __dirname, 'editing-toolkit-plugin', packageName, 'dist' );

		return {
			...baseConfig,
			name: packageName,
			output: {
				...baseConfig.output,
				path: outputPath,
			},
			entry,
		};
	} );
}

module.exports = getWebpackConfig;
