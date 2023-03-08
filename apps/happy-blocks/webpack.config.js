/**
 * WARNING: No ES6 modules here. Not transpiled!
 */
const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const webpack = require( 'webpack' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

function getWebpackConfig( env = { block: '' }, argv ) {
	const webpackConfig = getBaseWebpackConfig( { ...env, WP: true }, argv );
	const isProduction = process.env.NODE_ENV === 'production';

	const blockName = env.block.split( '/' ).pop();
	const blockPath = path.join( __dirname, 'block-library/', blockName );

	if ( ! blockName ) {
		throw new Error( 'No block specified.' );
	}

	const entry = () => {
		return {
			index: path.join( blockPath, 'index' ),
			view: path.join( blockPath, 'view' ),
		};
	};

	return {
		...webpackConfig,
		entry,
		output: {
			...webpackConfig.output,
			path: path.join( blockPath, '/build/' ),
			filename: '[name].js',
		},
		plugins: [
			...webpackConfig.plugins,
			new ReadableJsAssetsWebpackPlugin(),
			new HtmlWebpackPlugin( {
				filename: path.join( blockPath, '/build/', 'index.html' ),
				template: `!!prerender-loader?string&entry=./block-library/universal-header/view.tsx!${ path.join(
					blockPath,
					'index.html'
				) }`,
				inject: 'head',
			} ),
			new CopyPlugin( {
				patterns: [
					{
						from: path.resolve( blockPath, 'index.php' ),
						to: path.resolve( blockPath, 'build', '[name][ext]' ),
						transform( content ) {
							return content.toString().replace( '/build/rtl', '/rtl' ).replace( '/build', '/' );
						},
					},
					{
						from: path.resolve( blockPath, 'block.json' ),
						to: path.resolve( blockPath, 'build', '[name][ext]' ),
					},
					{
						from: path.resolve( blockPath, 'rtl/block.json' ),
						to: path.resolve( blockPath, 'build/rtl', '[name][ext]' ),
					},
				],
			} ),
			new webpack.DefinePlugin( {
				__i18n_text_domain__: JSON.stringify( 'happy-blocks' ),
			} ),
			...( isProduction
				? [
						new GenerateChunksMapPlugin( {
							output: path.join( blockPath, 'build/chunks-map.json' ),
						} ),
				  ]
				: [] ),
		],
	};
}

module.exports = getWebpackConfig;
