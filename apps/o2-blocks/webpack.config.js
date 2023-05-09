/**
 *WARNING: No ES6 modules here. Not transpiled! ****
 */

const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );

function getWebpackConfig( env, argv ) {
	const webpackConfig = getBaseWebpackConfig( { ...env, WP: true }, argv );

	return {
		...webpackConfig,
		entry: {
			editor: './src/editor.js',
			view: './src/view.js',
		},
		output: {
			...webpackConfig.output,
			filename: '[name].min.js',
		},
		plugins: [ ...webpackConfig.plugins, new ReadableJsAssetsWebpackPlugin() ],
	};
}

module.exports = getWebpackConfig;
