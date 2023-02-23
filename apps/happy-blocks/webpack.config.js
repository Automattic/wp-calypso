/**
 *WARNING: No ES6 modules here. Not transpiled! ****
 */

const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

function getWebpackConfig( env, argv ) {
	const webpackConfig = getBaseWebpackConfig( { ...env, WP: true }, argv );
	const isProduction = process.env.NODE_ENV === 'production';

	return {
		...webpackConfig,
		entry: {
			editor: './src/editor.js',
			view: './src/view.jsx',
		},
		output: {
			...webpackConfig.output,
			filename: '[name].min.js',
		},
		plugins: [
			...webpackConfig.plugins,
			new ReadableJsAssetsWebpackPlugin(),
			...( isProduction
				? [ new GenerateChunksMapPlugin( { output: './dist/chunks-map.json' } ) ]
				: [] ),
		],
	};
}

module.exports = getWebpackConfig;
