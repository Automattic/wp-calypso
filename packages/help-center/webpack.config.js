const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const webpack = require( 'webpack' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

/* Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 * @param   {Object}  env                           environment options
 * @param   {string}  env.source                    plugin slugs, comma separated list
 * @param   {Object}  argv                          options map
 * @param   {string}  argv.entry                    entry path
 * @returns {Object}                                webpack config
 */
function getWebpackConfig( env = { source: '' }, argv = {} ) {
	env.WP = true;
	const outputPath = path.join( __dirname, 'dist', 'apps' );

	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		mode: 'production',
		entry: {
			'help-center-gutenberg': path.join( __dirname, 'apps', 'help-center-gutenberg.js' ),
			'help-center-wp-admin': path.join( __dirname, 'apps', 'help-center-wp-admin.js' ),
			'help-center-gutenberg-disconnected': path.join(
				__dirname,
				'apps',
				'help-center-gutenberg-disconnected.js'
			),
			'help-center-wp-admin-disconnected': path.join(
				__dirname,
				'apps',
				'help-center-wp-admin-disconnected.js'
			),
		},
		output: {
			...webpackConfig.output,
			path: outputPath,
			// Unfortunately, we can't set the name to `[name].js` for the
			// dev env because at runtime we'd also need a way to detect
			// if the env was dev or prod, as the file is enqueued in WP
			// and there's no way to do that now. The simpler alternative
			// is to generate a .min.js for dev and prod, even though the
			// file is not really minified in the dev env.
			filename: '[name].min.js', // dynamic filename
			library: 'helpCenter',
		},
		plugins: [
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new webpack.DefinePlugin( {
				__i18n_text_domain__: JSON.stringify( 'default' ),
				'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			} ),
			new GenerateChunksMapPlugin( {
				output: path.resolve( './dist/chunks-map.json' ),
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
			new ReadableJsAssetsWebpackPlugin(),
			new CopyPlugin( {
				patterns: [
					{
						from: path.join( __dirname, 'apps', 'help-icon.svg' ),
						to: path.join( __dirname, 'dist', 'apps' ),
					},
				],
			} ),
		],
	};
}

module.exports = getWebpackConfig;
