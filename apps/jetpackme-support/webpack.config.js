const path = require( 'path' );
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const { shouldTranspileDependency } = require( '@automattic/calypso-build/webpack/util' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const autoprefixerPlugin = require( 'autoprefixer' );
const webpack = require( 'webpack' );
const cacheIdentifier = require( '../../build-tools/babel/babel-loader-cache-identifier' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );
const isDevelopment = process.env.NODE_ENV !== 'production';
const extraPath = 'fallback';
const cachePath = path.resolve( '.cache', extraPath );

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
	const outputPath = path.join( __dirname, 'dist' );

	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		mode: isDevelopment ? 'development' : 'production',
		entry: {
			'jetpackme-support': path.join( __dirname, 'index.js' ),
		},
		output: {
			...webpackConfig.output,
			path: outputPath,
			filename: '[name].min.js', // dynamic filename
			library: 'jetpackme-support',
		},
		optimization: {
			...webpackConfig.optimization,
			// disable module concatenation so that instances of `__()` are not renamed
			concatenateModules: false,
		},
		module: {
			rules: [
				TranspileConfig.loader( {
					workerCount: 2,
					configFile: path.resolve( '../../babel.config.js' ),
					cacheDirectory: path.resolve( cachePath, 'babel-client' ),
					cacheIdentifier,
					cacheCompression: false,
					exclude: /node_modules\//,
				} ),
				TranspileConfig.loader( {
					workerCount: 2,
					presets: [ require.resolve( '@automattic/calypso-babel-config/presets/dependencies' ) ],
					cacheDirectory: path.resolve( cachePath, 'babel-client' ),
					cacheIdentifier,
					cacheCompression: false,
					include: shouldTranspileDependency,
				} ),
				SassConfig.loader( {
					includePaths: [ __dirname ],
					postCssOptions: {
						// Do not use postcss.config.js. This ensure we have the final say on how PostCSS is used in calypso.
						// This is required because Calypso imports `@automattic/notifications` and that package defines its
						// own `postcss.config.js` that they use for their webpack bundling process.
						config: false,
						plugins: [ autoprefixerPlugin() ],
					},
					prelude: `@use '${ require.resolve(
						'calypso/assets/stylesheets/shared/_utils.scss'
					) }' as *;`,
				} ),
				FileConfig.loader(),
			],
		},
		plugins: [
			new webpack.DefinePlugin( {
				'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			} ),
			new GenerateChunksMapPlugin( {
				output: path.resolve( './dist/chunks-map.json' ),
			} ),
			...SassConfig.plugins( {
				filename: '[name].min.css',
				chunkFilename: '[contenthash].css',
				minify: ! isDevelopment,
			} ),
			new ReadableJsAssetsWebpackPlugin(),
		],
	};
}

module.exports = getWebpackConfig;
