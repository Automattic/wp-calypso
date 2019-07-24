/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const process = require( 'process' );
const webpack = require( 'webpack' );
const DuplicatePackageCheckerPlugin = require( 'duplicate-package-checker-webpack-plugin' );
const FileConfig = require( './webpack/file-loader' );
const Minify = require( './webpack/minify' );
const SassConfig = require( './webpack/sass' );
const TranspileConfig = require( './webpack/transpile' );
const WordPressExternalDependenciesPlugin = require( '@automattic/wordpress-external-dependencies-plugin' );

/**
 * Internal dependencies
 */
const { cssNameFromFilename } = require( './webpack/util' );
// const { workerCount } = require( './webpack.common' ); // todo: shard...

/**
 * Internal variables
 */
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Return a webpack config object
 *
 * Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 *
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 *
 * @param  {object}  env                           environment options
 * @param  {object}  argv                          options map
 * @param  {object}  argv.entry                    Entry point(s)
 * @param  {string}  argv.'output-path'            Output path
 * @param  {string}  argv.'output-filename'        Output filename pattern
 * @param  {string}  argv.'output-library-target'  Output library target
 * @return {object}                                webpack config
 */
function getWebpackConfig(
	env = {}, // eslint-disable-line no-unused-vars
	{
		entry,
		'output-chunk-filename': outputChunkFilename,
		'output-path': outputPath = path.join( process.cwd(), 'dist' ),
		'output-filename': outputFilename = '[name].js',
		'output-library-target': outputLibraryTarget = 'window',
	}
) {
	const workerCount = 1;

	const cssFilename = cssNameFromFilename( outputFilename );
	const cssChunkFilename = cssNameFromFilename( outputChunkFilename );

	let babelConfig = path.join( process.cwd(), 'babel.config.js' );
	let presets = [];
	if ( ! fs.existsSync( babelConfig ) ) {
		// Default to this package's Babel presets
		presets = [
			path.join( __dirname, 'babel', 'default' ),
			env.WP && path.join( __dirname, 'babel', 'wordpress-element' ),
		].filter( Boolean );
		babelConfig = undefined;
	}

	const webpackConfig = {
		bail: ! isDevelopment,
		entry,
		mode: isDevelopment ? 'development' : 'production',
		devtool: process.env.SOURCEMAP || ( isDevelopment ? '#eval' : false ),
		output: {
			chunkFilename: outputChunkFilename,
			path: outputPath,
			filename: outputFilename,
			libraryTarget: outputLibraryTarget,
		},
		optimization: {
			minimize: ! isDevelopment,
			minimizer: Minify( {
				cache: process.env.CIRCLECI
					? `${ process.env.HOME }/terser-cache`
					: 'docker' !== process.env.CONTAINER,
				parallel: workerCount,
				sourceMap: Boolean( process.env.SOURCEMAP ),
				terserOptions: {
					ecma: 5,
					safari10: true,
					mangle: true,
				},
			} ),
		},
		module: {
			rules: [
				TranspileConfig.loader( {
					cacheDirectory: true,
					configFile: babelConfig,
					exclude: /node_modules\//,
					presets,
					workerCount,
				} ),
				SassConfig.loader( {
					preserveCssCustomProperties: false,
					prelude: '@import "~@automattic/calypso-color-schemes/src/shared/colors";',
				} ),
				FileConfig.loader(),
			],
		},
		resolve: {
			extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
			modules: [ 'node_modules' ],
		},
		node: false,
		plugins: [
			new webpack.DefinePlugin( {
				'process.env.NODE_ENV': JSON.stringify( process.env.NODE_ENV ),
				global: 'window',
			} ),
			new webpack.IgnorePlugin( /^\.\/locale$/, /moment$/ ),
			...SassConfig.plugins( {
				chunkFilename: cssChunkFilename,
				filename: cssFilename,
				minify: ! isDevelopment,
			} ),
			new DuplicatePackageCheckerPlugin(),
			...( env.WP ? [ new WordPressExternalDependenciesPlugin() ] : [] ),
		],
	};

	return webpackConfig;
}

module.exports = getWebpackConfig;
