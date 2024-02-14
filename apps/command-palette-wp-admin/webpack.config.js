/**
 *WARNING: No ES6 modules here. Not transpiled! ****
 */

const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

function getWebpackConfig( env, argv ) {
	const webpackConfig = getBaseWebpackConfig( env, argv );

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
			...webpackConfig.plugins,
			new GenerateChunksMapPlugin( {
				output: path.resolve( __dirname, 'dist/chunks-map.json' ),
			} ),
		],
	};
}

module.exports = getWebpackConfig;
