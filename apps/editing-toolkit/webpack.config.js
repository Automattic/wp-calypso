/**
 * WARNING: No ES6 modules here. Not transpiled! *
 */

const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const webpack = require( 'webpack' );

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
 * @param   {Object}  env                           environment options
 * @param   {string}  env.source                    plugin slugs, comma separated list
 * @param   {Object}  argv                          options map
 * @param   {string}  argv.entry                    entry path
 * @returns {Object}                                webpack config
 */
function getWebpackConfig( env = { source: '' }, argv = {} ) {
	env.WP = true;

	// object provides ability to name the entry point
	// which enables dynamic file names
	const sources = env.source.split( ',' );

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

		accumulator[ scriptName ] = path.join( __dirname, 'editing-toolkit-plugin', source );
		return accumulator;
	}, {} );

	const outputPath = path.join( __dirname, 'editing-toolkit-plugin', packageName, 'dist' );

	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		entry,
		output: {
			...webpackConfig.output,
			path: outputPath,
			// Unfortunately, we can't set the name to `[name].js` for the
			// dev env because at runtime we'd also need a way to detect
			// if the env was dev or prod, as the file is enqueued in WP
			// and there's no way to do that now. The simpler alternative
			// is to generate a .min.js for dev and prod, even though the
			// file is not really minified in the dev env.
			filename: '[name].min.js', // dynamic filename
			library: 'EditingToolkit',
		},
		optimization: {
			...webpackConfig.optimization,
			// disable module concatenation so that instances of `__()` are not renamed
			concatenateModules: false,
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
				outputFilename: '[name].asset.php',
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
					// The extraction logic will only extract a package if requestToExternal
					// explicitly returns undefined for the given request. Null
					// shortcuts the logic such that react-i18n will be bundled.
					if ( request === '@wordpress/react-i18n' ) {
						return null;
					}
				},
			} ),
			new ReadableJsAssetsWebpackPlugin(),
		],
		devtool: isDevelopment ? 'inline-cheap-source-map' : 'source-map',
		stats: 'minimal',
	};
}

module.exports = getWebpackConfig;
