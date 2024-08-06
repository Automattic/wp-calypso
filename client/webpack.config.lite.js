const path = require( 'path' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const {
	cssNameFromFilename,
	shouldTranspileDependency,
} = require( '@automattic/calypso-build/webpack/util' );
const autoprefixerPlugin = require( 'autoprefixer' );
const cacheIdentifier = require( '../build-tools/babel/babel-loader-cache-identifier' );
const config = require( './server/config' );
const { workerCount } = require( './webpack.common' );

const bundleEnv = config( 'env' );
const isDevelopment = bundleEnv !== 'production';
const defaultBrowserslistEnv = 'evergreen';
const browserslistEnv = process.env.BROWSERSLIST_ENV || defaultBrowserslistEnv;
const extraPath = browserslistEnv === 'defaults' ? 'fallback' : browserslistEnv;
const cachePath = path.resolve( '.cache', extraPath );

let outputFilename = '[name].[contenthash].min.js';
let outputChunkFilename = '[name].[contenthash].min.js';
// we should not use chunkhash in development: https://github.com/webpack/webpack-dev-server/issues/377#issuecomment-241258405
// also we don't minify so dont name them .min.js
if ( isDevelopment ) {
	outputFilename = '[name].js';
	outputChunkFilename = '[name].js';
}

const cssFilename = cssNameFromFilename( outputFilename );
const cssChunkFilename = cssNameFromFilename( outputChunkFilename );

const outputDir = path.resolve( '.' );

const webpackConfig = {
	context: __dirname,
	entry: path.join( __dirname, 'lite', 'boot' ),
	mode: 'development',
	devtool: 'source-map',
	output: {
		path: path.join( outputDir, 'public', extraPath ),
		publicPath: `/calypso/${ extraPath }`,
		pathinfo: false,
		filename: outputFilename,
		chunkFilename: outputChunkFilename,
		devtoolModuleFilenameTemplate: 'app:///[resource-path]',
	},
	node: false,
	resolve: {
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
		mainFields: [ 'browser', 'calypso:src', 'module', 'main' ],
		alias: Object.assign( {
			calypso: __dirname,
		} ),
	},
	module: {
		strictExportPresence: true,
		rules: [
			TranspileConfig.loader( {
				workerCount,
				configFile: path.resolve( 'babel.config.js' ),
				cacheDirectory: path.resolve( cachePath, 'babel-client' ),
				cacheIdentifier,
				cacheCompression: false,
				exclude: /node_modules\//,
			} ),
			TranspileConfig.loader( {
				workerCount,
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
				prelude: `@use '${
					path
						// Path, relative to Node CWD
						.relative(
							process.cwd(),
							path.join( __dirname, 'assets/stylesheets/shared/_utils.scss' )
						)
						.split( path.sep ) // Break any path (posix/win32) by path separator
						.join( path.posix.sep ) // Convert the path explicitly to posix to ensure imports work fine
				}' as *;`,
			} ),
		],
	},
	plugins: [
		...SassConfig.plugins( {
			chunkFilename: cssChunkFilename,
			filename: cssFilename,
		} ),
	],
};

module.exports = webpackConfig;
