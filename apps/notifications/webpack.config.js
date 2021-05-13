/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const path = require( 'path' );
const spawnSync = require( 'child_process' ).spawnSync;

/**
 * Return a webpack config object
 *
 * Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args. Note that webpack-cli seems to convert
 * kebab-case (like `--ouput-path`) to camelCase (`outputPath`)
 *
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 *
 * @param  {object}  env                           environment options
 * @param  {object}  argv                          options map
 * @param  {object}  argv.entry                    Entry point(s)
 * @param  {string}  argv.outputPath                Output path
 * @param  {string}  argv.outputFilename            Output filename pattern
 * @returns {object}                                webpack config
 */
function getWebpackConfig(
	env = {},
	{
		entry = path.join( __dirname, 'src', 'standalone' ),
		outputPath = path.join( __dirname, 'dist' ),
		outputFilename = 'build.min.js',
	}
) {
	const webpackConfig = getBaseWebpackConfig( env, {
		entry,
		'output-filename': outputFilename,
		'output-path': outputPath,
	} );

	const pageMeta = {
		nodePlatform: process.platform,
		nodeVersion: process.version,
		gitDescribe: spawnSync( 'git', [ 'describe', '--always', '--dirty', '--long' ], {
			encoding: 'utf8',
		} ).stdout.replace( '\n', '' ),
	};

	return {
		...webpackConfig,
		plugins: [
			...webpackConfig.plugins,
			new HtmlWebpackPlugin( {
				filename: path.join( outputPath, 'index.html' ),
				template: path.join( __dirname, 'src', 'index.ejs' ),
				title: 'Notifications',
				hash: true,
				inject: false,
				isRTL: false,
				...pageMeta,
			} ),
			new HtmlWebpackPlugin( {
				filename: path.join( outputPath, 'rtl.html' ),
				template: path.join( __dirname, 'src', 'index.ejs' ),
				title: 'Notifications',
				hash: true,
				inject: false,
				isRTL: true,
				...pageMeta,
			} ),
			new HtmlWebpackPlugin( {
				filename: path.join( outputPath, 'cache-buster.txt' ),
				templateContent: () => pageMeta.gitDescribe,
				inject: false,
			} ),
		],
	};
}

module.exports = getWebpackConfig;
