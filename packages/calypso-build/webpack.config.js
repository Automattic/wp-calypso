/**
 * WARNING: No ES6 modules here. Not transpiled! *
 */
/* eslint-disable import/no-nodejs-modules */

const fs = require( 'fs' );
const path = require( 'path' );
const process = require( 'process' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const DuplicatePackageCheckerPlugin = require( 'duplicate-package-checker-webpack-plugin' );
const webpack = require( 'webpack' );
const FileConfig = require( './webpack/file-loader' );
const Minify = require( './webpack/minify' );
const SassConfig = require( './webpack/sass' );
const TranspileConfig = require( './webpack/transpile' );
const { cssNameFromFilename, shouldTranspileDependency } = require( './webpack/util' );
// const { workerCount } = require( './webpack.common' ); // todo: shard...

/**
 * Internal variables
 */
const isDevelopment = process.env.NODE_ENV !== 'production';
const cachePath = path.resolve( '.cache' );
const shouldCheckForDuplicatePackages = ! process.env.DISABLE_DUPLICATE_PACKAGE_CHECK;

/**
 * Return a webpack config object
 *
 * Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 * @param  {Object}  env                                 environment options
 * @param  {Object}  argv                                options map
 * @param  {Object}  argv.entry                          Entry point(s)
 * @param  {string}  argv.'output-chunk-filename'        Output chunk filename
 * @param  {string}  argv.'output-path'                  Output path
 * @param  {string}  argv.'output-filename'              Output filename pattern
 * @param  {string}  argv.'output-library-target'        Output library target
 * @param  {string}  argv.'output-chunk-loading-global'  Output chunk loading global
 * @returns {Object}                                     webpack config
 */
function getWebpackConfig(
	env = {},
	{
		entry,
		'output-chunk-filename': outputChunkFilename,
		'output-path': outputPath = path.join( process.cwd(), 'dist' ),
		'output-filename': outputFilename = '[name].js',
		'output-library-target': outputLibraryTarget = 'window',
		'output-chunk-loading-global': outputChunkLoadingGlobal = 'webpackChunkwebpack',
	} = {}
) {
	const workerCount = 1;

	const cssFilename = cssNameFromFilename( outputFilename );
	const cssChunkFilename = cssNameFromFilename( outputChunkFilename );

	let babelConfig = path.join( process.cwd(), 'babel.config.js' );
	let presets = [];
	if ( ! fs.existsSync( babelConfig ) ) {
		presets = [
			require.resolve( '@automattic/calypso-babel-config/presets/default' ),
			env.WP && require.resolve( '@automattic/calypso-babel-config/presets/wordpress-element' ),
		].filter( Boolean );
		babelConfig = undefined;
	}

	// Use this package's PostCSS config. If it doesn't exist postcss will look
	// for the config file starting in the current directory (https://github.com/webpack-contrib/postcss-loader#config-cascade)
	const consumerPostCssConfig = path.join( process.cwd(), 'postcss.config.js' );
	const postCssConfigPath = fs.existsSync( consumerPostCssConfig )
		? consumerPostCssConfig
		: path.join( __dirname, 'postcss.config.js' );

	const webpackConfig = {
		bail: ! isDevelopment,
		entry,
		mode: isDevelopment ? 'development' : 'production',
		devtool: process.env.SOURCEMAP || ( isDevelopment ? 'eval' : false ),
		output: {
			chunkFilename: outputChunkFilename,
			path: outputPath,
			filename: outputFilename,
			libraryTarget: outputLibraryTarget,
			chunkLoadingGlobal: outputChunkLoadingGlobal,
		},
		optimization: {
			minimize: ! isDevelopment,
			minimizer: Minify(),
		},
		module: {
			strictExportPresence: true,
			rules: [
				TranspileConfig.loader( {
					cacheDirectory: path.resolve( cachePath, 'babel' ),
					configFile: babelConfig,
					exclude: /node_modules\//,
					presets,
					workerCount,
				} ),
				TranspileConfig.loader( {
					cacheDirectory: path.resolve( cachePath, 'babel' ),
					include: shouldTranspileDependency,
					presets: [ require.resolve( '@automattic/calypso-babel-config/presets/dependencies' ) ],
					workerCount,
				} ),
				SassConfig.loader( {
					postCssOptions: {
						config: postCssConfigPath,
					},
				} ),
				FileConfig.loader(),
			],
		},
		resolve: {
			extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
			mainFields: [ 'browser', 'calypso:src', 'module', 'main' ],
			conditionNames: [ 'calypso:src', 'import', 'module', 'require' ],
			modules: [ 'node_modules' ],
			fallback: {
				stream: require.resolve( 'stream-browserify' ),
			},
		},
		node: false,
		plugins: [
			new webpack.DefinePlugin( {
				'typeof window': JSON.stringify( 'object' ),
				'process.env.NODE_ENV': JSON.stringify( process.env.NODE_ENV ),
				'process.env.FORCE_REDUCED_MOTION': JSON.stringify(
					!! process.env.FORCE_REDUCED_MOTION || false
				),
				global: 'window',
			} ),
			new webpack.IgnorePlugin( { resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ } ),
			...SassConfig.plugins( {
				chunkFilename: cssChunkFilename,
				filename: cssFilename,
				minify: ! isDevelopment,
			} ),
			...( shouldCheckForDuplicatePackages ? [ new DuplicatePackageCheckerPlugin() ] : [] ),
			...( env.WP ? [ new DependencyExtractionWebpackPlugin( { injectPolyfill: true } ) ] : [] ),
		],
	};

	return webpackConfig;
}

module.exports = getWebpackConfig;
