/**
 *WARNING: No ES6 modules here. Not transpiled! ****
 */

const spawnSync = require( 'child_process' ).spawnSync;
const path = require( 'path' );
const BuildMetaPlugin = require( '@automattic/calypso-apps-builder/build-meta-webpack-plugin.cjs' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const ExtensiveLodashReplacementPlugin = require( '@automattic/webpack-extensive-lodash-replacement-plugin' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );

const shouldEmitStats = process.env.EMIT_STATS && process.env.EMIT_STATS !== 'false';

/**
 * Return a webpack config object
 *
 * Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args. Note that webpack-cli seems to convert
 * kebab-case (like `--ouput-path`) to camelCase (`outputPath`)
 *
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 * @param  {Object}  env                           environment options
 * @param  {Object}  argv                          options map
 * @param  {Object}  argv.entry                    Entry point(s)
 * @param  {string}  argv.outputPath                Output path
 * @param  {string}  argv.outputFilename            Output filename pattern
 * @returns {Object}                                webpack config
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
		optimization: {
			concatenateModules: ! shouldEmitStats,
		},
		devServer: {
			host: 'calypso.localhost',
			port: 3000,
			static: {
				directory: path.join( __dirname, 'dist' ),
			},
			client: {
				progress: true,
			},
			watchFiles: [ 'dist/**/*' ],
		},
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
			shouldEmitStats &&
				new BundleAnalyzerPlugin( {
					analyzerMode: 'disabled', // just write the stats.json file
					generateStatsFile: true,
					statsFilename: path.join( __dirname, 'stats.json' ),
					statsOptions: {
						source: false,
						reasons: true,
						optimizationBailout: false,
						chunkOrigins: false,
						chunkGroups: true,
					},
				} ),
			new ExtensiveLodashReplacementPlugin(),
			BuildMetaPlugin( { outputPath } ),
		].filter( Boolean ),
	};
}

module.exports = getWebpackConfig;
