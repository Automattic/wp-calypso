const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

module.exports = ( env = {}, argv = {} ) => {
	const webpackConfig = getBaseWebpackConfig( { ...env, WP: false }, argv );

	return {
		...webpackConfig,
		entry: { webmcp: path.join( __dirname, 'webmcp.js' ) },
		output: {
			...webpackConfig.output,
			path: path.join( __dirname, 'dist' ),
			filename: '[name].min.js',
			library: 'wpcomWebMcp',
			uniqueName: 'wpcom-webmcp',
			chunkLoadingGlobal: 'webpackChunk_wpcom_webmcp',
		},
		plugins: [
			...webpackConfig.plugins,
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill: false,
				useDefaults: false,
				outputFilename: '[name].asset.json',
				outputFormat: 'json',
			} ),
		],
	};
};
