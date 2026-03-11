const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const webpack = require( 'webpack' );

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Return a webpack config object
 *
 * @param   {Object}  env                           environment options
 * @param   {Object}  argv                          options map
 * @returns {Object}                                webpack config
 */
function getWebpackConfig( env = { WP: true }, argv = {} ) {
	const outputPath = path.join( __dirname, 'dist' );
	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		mode: isDevelopment ? 'development' : 'production',
		devtool: isDevelopment ? 'inline-cheap-source-map' : 'source-map',
		entry: {
			'wpcom-gutenberg-rtc': path.join( __dirname, 'src', 'index.ts' ),
		},
		output: {
			...webpackConfig.output,
			path: outputPath,
			filename: '[name].min.js',
			chunkFilename: '[id].[contenthash:8].min.js',
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
				'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				outputFilename: '[name].asset.json',
				outputFormat: 'json',
			} ),
			new ReadableJsAssetsWebpackPlugin(),
		],
		externals: {
			// Resolve @wordpress/sync to the global `wp.sync` provided by WordPress.
			// Array format is required for nested property access (dot-separated
			// strings are treated as a single variable name by webpack).
			'@wordpress/sync': [ 'wp', 'sync' ],
			// Resolve Yjs to the global `wp.sync.Y` to avoid two separate Yjs
			// instances, which breaks shared document types. See:
			// https://github.com/yjs/yjs/issues/438
			yjs: [ 'wp', 'sync', 'Y' ],
		},
	};
}

module.exports = getWebpackConfig;
