/**
 *WARNING: No ES6 modules here. Not transpiled! ****
 */
const path = require( 'path' );
const BuildMetaPlugin = require( '@automattic/calypso-apps-builder/build-meta-webpack-plugin.cjs' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );

const outputPath = path.join( __dirname, 'release-files' );

function getWebpackConfig( env, argv ) {
	const webpackConfig = getBaseWebpackConfig( { ...env, WP: true }, argv );

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
			BuildMetaPlugin( { outputPath } ),
			new ReadableJsAssetsWebpackPlugin(),
		],
	};
}

module.exports = getWebpackConfig;
