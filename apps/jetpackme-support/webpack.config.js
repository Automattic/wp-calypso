const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const webpack = require( 'webpack' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

/* Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 * @param   {Object}  env                           environment options
 * @param   {string}  env.source                    plugin slugs, comma separated list
 * @param   {Object}  argv                          options map
 * @param   {string}  argv.entry                    entry path
 * @returns {Object}                                webpack config
 */
function getWebpackConfig( env = { source: '' }, argv = {} ) {
	const webpackConfig = getBaseWebpackConfig( { ...env, WP: true }, argv );

	return {
		...webpackConfig,
		entry: {
			'jetpackme-support': path.join( __dirname, 'src/index.js' ),
		},
		output: {
			...webpackConfig.output,
			filename: '[name].min.js', // dynamic filename
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
				__i18n_text_domain__: JSON.stringify( 'default' ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill: true,
				outputFormat: 'json',
			} ),
			new GenerateChunksMapPlugin( {
				output: path.resolve( './dist/chunks-map.json' ),
			} ),
			new ReadableJsAssetsWebpackPlugin(),
		],
	};
}

module.exports = getWebpackConfig;
