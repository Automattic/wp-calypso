const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const webpack = require( 'webpack' );

const isDevelopment = process.env.NODE_ENV !== 'production';

/* Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @param   {Object}  env   environment options
 * @param   {Object}  argv  options map
 * @returns {Object}        webpack config
 */
function getWebpackConfig( env = { source: '' }, argv = {} ) {
	env.WP = true;

	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		mode: isDevelopment ? 'development' : 'production',
		entry: { survicate: path.join( __dirname, 'survicate.js' ) },
		output: {
			...webpackConfig.output,
			path: path.join( __dirname, 'dist' ),
			filename: '[name].min.js',
			chunkFilename: '[id].[contenthash:8].min.js',
			library: 'wpcomSurvicate',
		},
		plugins: [
			// The base config's extraction plugin writes a PHP asset file; we want
			// the JSON `survicate.asset.json` that class-survicate.php reads.
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new webpack.DefinePlugin( {
				'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				// wp-admin registers wp-polyfill itself and the package is plain ES2017+.
				injectPolyfill: false,
				outputFilename: '[name].asset.json',
				outputFormat: 'json',
			} ),
			new ReadableJsAssetsWebpackPlugin(),
		],
	};
}

module.exports = getWebpackConfig;
