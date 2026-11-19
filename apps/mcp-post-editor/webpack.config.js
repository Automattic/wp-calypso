const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );

const isDevelopment = process.env.NODE_ENV !== 'production';

/* Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @param   {Object}  env   environment options
 * @param   {Object}  argv  options map
 * @returns {Object}        webpack config
 */
function getWebpackConfig( env = { source: '' }, argv = {} ) {
	env.WP = true;

	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		mode: isDevelopment ? 'development' : 'production',
		entry: { 'mcp-post-editor': path.join( __dirname, 'index.ts' ) },
		output: {
			...webpackConfig.output,
			path: path.join( __dirname, 'dist' ),
			filename: '[name].min.js',
			chunkFilename: '[id].[contenthash:8].min.js',
		},
		plugins: [
			// The base config's extraction plugin writes a PHP asset file; wpcom reads
			// `version` from the JSON `mcp-post-editor.asset.json`.
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			// The page runs in an MCP host's sandboxed iframe, with no WordPress
			// scripts, so every dependency is bundled and the manifest lists none.
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill: false,
				outputFilename: '[name].asset.json',
				outputFormat: 'json',
				useDefaults: false,
			} ),
			new ReadableJsAssetsWebpackPlugin(),
		],
	};
}

module.exports = getWebpackConfig;
