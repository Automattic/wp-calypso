const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const webpack = require( 'webpack' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

const isDevelopment = process.env.NODE_ENV !== 'production';

function getIndividualConfig( options = {} ) {
	const { name, env, argv, injectPolyfill = true } = options;

	const outputPath = path.join( __dirname, 'dist' );
	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		mode: isDevelopment ? 'development' : 'production',
		entry: { [ name ]: path.join( __dirname, `${ name }.js` ) },
		output: {
			...webpackConfig.output,
			path: outputPath,
			filename: '[name].min.js',
			library: 'agentsManager',
		},
		module: {
			...webpackConfig.module,
			rules: [
				...( webpackConfig.module?.rules || [] ),
				// Handle image assets from image-studio package
				{
					test: /\.(webp|png|jpg|jpeg|gif|svg)$/i,
					include: /image-studio/,
					type: 'asset/resource',
					generator: {
						filename: 'images/[name].[contenthash:8][ext]',
					},
				},
			],
		},
		optimization: {
			...webpackConfig.optimization,
			// disable module concatenation so that instances of `__()` are not renamed
			concatenateModules: false,
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
				injectPolyfill,
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
		],
	};
}

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

	return [
		getIndividualConfig( { env, argv, name: 'agents-manager-gutenberg' } ),
		getIndividualConfig( { env, argv, name: 'agents-manager-wp-admin' } ),
		getIndividualConfig( { env, argv, name: 'image-studio' } ),
	];
}

module.exports = getWebpackConfig;
