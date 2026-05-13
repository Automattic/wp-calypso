const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const webpack = require( 'webpack' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

const isDevelopment = process.env.NODE_ENV !== 'production';

function getWebpackConfig( env = { source: '' }, argv = {} ) {
	env.WP = true;

	const name = 'wpcom-smart-dictation';
	const outputPath = path.join( __dirname, 'dist' );
	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		mode: isDevelopment ? 'development' : 'production',
		entry: { [ name ]: path.join( __dirname, name ) },
		output: {
			...webpackConfig.output,
			path: outputPath,
			filename: '[name].min.js',
			chunkFilename: `[id].[contenthash:8].min.js`,
			library: 'wpcomSmartDictation',
		},
		optimization: {
			...webpackConfig.optimization,
			concatenateModules: false,
		},
		plugins: [
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new webpack.DefinePlugin( {
				__i18n_text_domain__: JSON.stringify( 'default' ),
				'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			} ),
			new GenerateChunksMapPlugin( {
				output: path.resolve( './dist/chunks-map.json' ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				outputFilename: '[name].asset.json',
				outputFormat: 'json',
				requestToExternal( request ) {
					if ( request === '@wordpress/react-i18n' ) {
						return null;
					}

					if ( request === '@wordpress/ui' ) {
						return null;
					}
				},
			} ),
			new ReadableJsAssetsWebpackPlugin(),
		],
	};
}

module.exports = getWebpackConfig;
