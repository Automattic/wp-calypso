const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const webpack = require( 'webpack' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

/**
 * Get webpack configuration
 * @param {Object} env - Environment variables
 * @param {Object} argv - CLI arguments
 * @returns {Object} Webpack configuration object
 */
function getWebpackConfig( env = {}, argv = {} ) {
	const webpackConfig = getBaseWebpackConfig( { ...env, WP: true }, argv );

	return {
		...webpackConfig,
		entry: {
			newsletter: path.join( __dirname, 'src', 'index.js' ),
		},
		output: {
			...webpackConfig.output,
			filename: '[name].min.js',
		},
		plugins: [
			new webpack.DefinePlugin( {
				__i18n_text_domain__: JSON.stringify( 'newsletter-widget' ),
			} ),
			new GenerateChunksMapPlugin( {
				output: path.resolve( __dirname, 'dist/chunks-map.json' ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill: true,
				outputFilename: '[name].asset.json',
				outputFormat: 'json',
				requestToExternal( request ) {
					// The extraction logic will only extract a package if requestToExternal
					// explicitly returns undefined for the given request. Null
					// shortcuts the logic such that react-i18n will be bundled.
					if ( request === '@wordpress/react-i18n' ) {
						return null;
					}
				},
			} ),
		],
	};
}

module.exports = getWebpackConfig;
