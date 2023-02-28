/**
 *WARNING: No ES6 modules here. Not transpiled! ****
 */

const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const webpack = require( 'webpack' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

function getWebpackConfig( env, argv ) {
	const webpackConfig = getBaseWebpackConfig( { ...env, WP: true }, argv );
	const isProduction = process.env.NODE_ENV === 'production';

	return {
		...webpackConfig,
		entry: {
			'universal-header/index': './src/universal-header/index.tsx',
			'universal-header/view': './src/universal-header/view.tsx',
			'universal-footer/index': './src/universal-footer/index.tsx',
			'universal-footer/view': './src/universal-footer/view.tsx',
			'pricing-plans/index': './src/pricing-plans/index.jsx',
			'pricing-plans/view': './src/pricing-plans/view.tsx',
		},
		output: {
			...webpackConfig.output,
			filename: '[name].js',
		},
		plugins: [
			...webpackConfig.plugins,
			new ReadableJsAssetsWebpackPlugin(),
			new webpack.DefinePlugin( {
				__i18n_text_domain__: JSON.stringify( 'happy-blocks' ),
			} ),
			...( isProduction
				? [ new GenerateChunksMapPlugin( { output: './dist/chunks-map.json' } ) ]
				: [] ),
		],
	};
}

module.exports = getWebpackConfig;
