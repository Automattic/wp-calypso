/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const path = require( 'path' );
const webpack = require( 'webpack' );
const DuplicatePackageCheckerPlugin = require( 'duplicate-package-checker-webpack-plugin' );
const FileConfig = require( './webpack/file-loader' );
const Minify = require( './webpack/minify' );
const SassConfig = require( './webpack/sass' );
const TranspileConfig = require( './webpack/transpile' );
const wordpressExternals = require( './webpack/wordpress-externals' );

/**
 * Internal dependencies
 */
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
		'output-path': outputPath = path.join( __dirname, 'dist' ),
		'output-filename': outputFilename = '[name].js',
		'output-libary-target': outputLibraryTarget = 'window',
	}
) {
	const workerCount = 1;
	const cssFilename = '[name].css';

	const webpackConfig = {
		bail: ! isDevelopment,
		entry,
		mode: isDevelopment ? 'development' : 'production',
		devtool: process.env.SOURCEMAP || ( isDevelopment ? '#eval' : false ),
		output: {
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
					workerCount,
					configFile: path.join( __dirname, 'babel.config.js' ),
					cacheDirectory: path.join( __dirname, '.cache' ),
					exclude: /node_modules\//,
				} ),
				SassConfig.loader( {
					preserveCssCustomProperties: false,
					includePaths: [ path.join( __dirname, 'client' ) ],
					prelude: '@import "~@automattic/calypso-color-schemes/src/shared/colors";',
				} ),
				FileConfig.loader(),
			],
		},
		resolve: {
			extensions: [ '.json', '.js', '.jsx' ],
			modules: [ 'node_modules' ],
		},
		node: false,
		plugins: [
			new webpack.DefinePlugin( {
				'process.env.NODE_ENV': JSON.stringify( process.env.NODE_ENV ),
				global: 'window',
			} ),
			new webpack.IgnorePlugin( /^\.\/locale$/, /moment$/ ),
			...SassConfig.plugins( { cssFilename, minify: ! isDevelopment } ),
			new DuplicatePackageCheckerPlugin(),
		],
		externals: [ wordpressExternals, 'wp', 'lodash' ],
	};

	return webpackConfig;
}

module.exports = getWebpackConfig;
