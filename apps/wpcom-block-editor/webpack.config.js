/**
 *WARNING: No ES6 modules here. Not transpiled! ****
 */

const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const webpack = require( 'webpack' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );

/**
 * Internal variables
 */
const isDevelopment = process.env.NODE_ENV !== 'production';
const shouldEmitStats = process.env.EMIT_STATS && process.env.EMIT_STATS !== 'false';

/**
 * Return a webpack config object
 *
 * Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args. Note that webpack-cli seems to convert
 * kebab-case (like `--ouput-path`) to camelCase (`outputPath`)
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 * @param   {Object}  env                           environment options
 * @param   {Object}  argv                          options map
 * @param   {Object}  argv.entry                    Entry point(s)
 * @param   {string}  argv.outputPath               Output path
 * @param   {string}  argv.outputFilename           Output filename pattern
 * @returns {Object}                                webpack config
 */
function getWebpackConfig(
	env = { WP: true },
	{
		entry = {
			'default.editor': path.join( __dirname, 'src', 'default', 'editor' ),
			'default.view': path.join( __dirname, 'src', 'default', 'view' ),
			'wpcom.editor': path.join( __dirname, 'src', 'wpcom', 'editor' ),
			'calypso.editor': path.join( __dirname, 'src', 'calypso', 'editor' ),
			'calypso.tinymce': path.join( __dirname, 'src', 'calypso', 'tinymce' ),
		},
		outputPath = path.join( __dirname, 'dist' ),
		outputFilename = isDevelopment ? '[name].js' : '[name].min.js',
	}
) {
	const webpackConfig = getBaseWebpackConfig( env, {
		entry,
		'output-filename': outputFilename,
		'output-path': outputPath,
	} );

	return {
		...webpackConfig,
		devtool: isDevelopment ? 'inline-cheap-source-map' : 'source-map',
		optimization: {
			...webpackConfig.optimization,
			// disable module concatenation so that instances of `__()` are not renamed
			concatenateModules: false,
		},
		plugins: [
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			/**
			 * This is needed for import-ing ThemeUpgradeModal,
			 * which is directly due to the use of NODE_DEBUG in the package called `util`.
			 */
			new webpack.DefinePlugin( {
				'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				requestToExternal( request ) {
					if ( request === 'tinymce/tinymce' ) {
						return 'tinymce';
					}
					// Force bundling the React JSX runtime packages so that we don't have a missing `react-jsx-runtime`
					// dependency on older WordPress versions that don't ship it yet.
					if ( request === 'react/jsx-runtime' || request === 'react/jsx-dev-runtime' ) {
						// returning null means don't externalize;
						// returning undefined means call the default `requestToExternal`, which _would_ externalize `react-jsx-runtime`.
						return null;
					}
				},
				requestToHandle( request ) {
					if ( request === 'tinymce/tinymce' ) {
						return 'wp-tinymce';
					}
				},
			} ),
			shouldEmitStats &&
				new BundleAnalyzerPlugin( {
					analyzerMode: 'server',
					statsOptions: {
						source: false,
						reasons: false,
						optimizationBailout: false,
						chunkOrigins: false,
						chunkGroups: true,
					},
				} ),
		],
	};
}

module.exports = getWebpackConfig;
