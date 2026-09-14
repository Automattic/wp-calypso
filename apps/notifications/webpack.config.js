/**
 *WARNING: No ES6 modules here. Not transpiled! ****
 */

const spawnSync = require( 'child_process' ).spawnSync;
const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const ExtensiveLodashReplacementPlugin = require( '@automattic/webpack-extensive-lodash-replacement-plugin' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const GenerateChunksMapPlugin = require( '../../build-tools/webpack/generate-chunks-map-plugin' );

const shouldEmitStats = process.env.EMIT_STATS && process.env.EMIT_STATS !== 'false';
const isDevelopment = process.env.NODE_ENV !== 'production';

// While this used to be the output of "git describe", we don't really use
// tags enough to justify it. Now, the short sha will be good enough. The commit
// sha from process.env is set by TeamCity, and tracks GitHub. (rev-parse often
// does not.)
const gitDescribe = (
	process.env.commit_sha ??
	spawnSync( 'git', [ 'rev-parse', 'HEAD' ], {
		encoding: 'utf8',
	} ).stdout.replace( '\n', '' )
).slice( 0, 11 );

const pageMeta = {
	'git-describe': gitDescribe,
};

/**
 * Build a webpack config object for a single standalone entry.
 * @param  {Object}  env                  environment options
 * @param  {Object}  options              entry options
 * @param  {string}  options.entry        entry point
 * @param  {string}  options.outputPath   output path
 * @param  {string}  options.publicPath   public path used in the generated HTML
 * @param  {boolean} options.withStats    whether to emit bundle stats for this entry
 * @returns {Object}                      webpack config
 */
function buildConfig( env, { entry, outputPath, publicPath, withStats } ) {
	const webpackConfig = getBaseWebpackConfig( env, {
		entry,
		'output-filename': 'build.min.js',
		'output-path': outputPath,
	} );

	return {
		...webpackConfig,
		optimization: {
			concatenateModules: ! shouldEmitStats,
		},
		plugins: [
			...webpackConfig.plugins,
			new HtmlWebpackPlugin( {
				filename: path.join( outputPath, 'index.html' ),
				template: path.join( __dirname, 'src', 'index.ejs' ),
				publicPath,
				hash: true,
				inject: false,
				scriptLoading: 'blocking',
				meta: pageMeta,
				includeStyle: ( href ) => ! href.includes( '.rtl.css' ),
			} ),
			new HtmlWebpackPlugin( {
				filename: path.join( outputPath, 'rtl.html' ),
				template: path.join( __dirname, 'src', 'index.ejs' ),
				publicPath,
				hash: true,
				inject: false,
				scriptLoading: 'blocking',
				meta: pageMeta,
				includeStyle: ( href ) => href.includes( '.rtl.css' ),
			} ),
			new GenerateChunksMapPlugin( {
				output: path.resolve( outputPath, 'chunks-map.json' ),
			} ),
			withStats &&
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
		].filter( Boolean ),
		devtool: isDevelopment ? 'inline-cheap-source-map' : 'source-map',
	};
}

/**
 * Return the webpack config(s).
 *
 * Two standalone entries are built side by side while we migrate the widget
 * from the legacy `src/panel` UI to the new `src/app` UI:
 *   - `src/standalone`     → dist/      (panel, served from /notifications/)
 *   - `src/standalone-app` → dist/app/  (app,   served from /notifications/app/)
 *
 * Arguments to this function replicate webpack's so this config can be used on the command line.
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 * @param  {Object} env environment options
 * @returns {Array}     webpack configs
 */
function getWebpackConfig( env = {} ) {
	return [
		buildConfig( env, {
			entry: path.join( __dirname, 'src', 'standalone' ),
			outputPath: path.join( __dirname, 'dist' ),
			publicPath: 'https://widgets.wp.com/notifications/',
			withStats: shouldEmitStats,
		} ),
		buildConfig( env, {
			entry: path.join( __dirname, 'src', 'standalone-app' ),
			outputPath: path.join( __dirname, 'dist', 'app' ),
			publicPath: 'https://widgets.wp.com/notifications/app/',
			withStats: false,
		} ),
	];
}

module.exports = getWebpackConfig;
