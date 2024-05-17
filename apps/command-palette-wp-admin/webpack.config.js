/**
 *WARNING: No ES6 modules here. Not transpiled! ****
 */

const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const webpack = require( 'webpack' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

function getWebpackConfig( env, argv ) {
	const webpackConfig = getBaseWebpackConfig( { ...env, WP: true }, argv );

	return {
		...webpackConfig,
		entry: {
			build: path.join( __dirname, 'src', 'index' ),
		},
		output: {
			...webpackConfig.output,
			filename: '[name].min.js',
		},
		plugins: [
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new GenerateChunksMapPlugin( {
				output: path.resolve( __dirname, 'dist/chunks-map.json' ),
			} ),
			new webpack.DefinePlugin( {
				__i18n_text_domain__: JSON.stringify( 'command-palette' ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill: true,
				outputFilename: '[name].asset.php',
				requestToExternal( request ) {
					// The extraction logic will only extract a dependency if requestToExternal
					// explicitly returns undefined for the given request. Null shortcuts the
					// logic such that @wordpress/commands styles and @wordpress/react-i18n are bundled.
					if (
						request === '@wordpress/commands/build-style/style.css' ||
						request === '@wordpress/react-i18n'
					) {
						return null;
					}
				},
			} ),
		],
	};
}

module.exports = getWebpackConfig;
