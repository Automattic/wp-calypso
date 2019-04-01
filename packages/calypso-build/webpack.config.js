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
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const Minify = require( '@automattic/calypso-build/webpack/minify' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const wordpressExternals = require( '@automattic/calypso-build/webpack/wordpress-externals' );

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
 * @return {object} webpack config
 */
function getWebpackConfig(
	env,
	{
		entry,
		output = {
			path: path.join( __dirname, 'dist' ),
			filename: '[name].js',
			libraryTarget: 'window',
		},
	}
) {
	const workerCount = 1;
	const cssFilename = '[name].css';

	const webpackConfig = {
		bail: ! isDevelopment,
		context: __dirname,
		entry,
		mode: isDevelopment ? 'development' : 'production',
		devtool: process.env.SOURCEMAP || ( isDevelopment ? '#eval' : false ),
		output,
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
