/**
 * WARNING: No ES6 modules here. Not transpiled! *
 */

const path = require( 'path' );
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const { shouldTranspileDependency } = require( '@automattic/calypso-build/webpack/util' );
const webpack = require( 'webpack' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const nodeExternals = require( 'webpack-node-externals' );
const cacheIdentifier = require( '../build-tools/babel/babel-loader-cache-identifier' );
const { packagesInMonorepo } = require( '../build-tools/lib/monorepo' );
const ExternalModulesWriter = require( './server/bundler/external-modules' );
const config = require( './server/config' );
const bundleEnv = config( 'env' );
const { workerCount } = require( './webpack.common' );

/**
 * Internal variables
 */
const isDevelopment = bundleEnv === 'development';
const devTarget = process.env.DEV_TARGET || 'evergreen';
const shouldEmitStats = process.env.EMIT_STATS && process.env.EMIT_STATS !== 'false';
const shouldEmitStatsWithReasons = process.env.EMIT_STATS === 'withreasons';
const shouldConcatenateModules = process.env.CONCATENATE_MODULES !== 'false';
const cacheDirectory = path.resolve( '.cache', 'babel-server' );

const fileLoader = FileConfig.loader( {
	// The final URL of the image is `${publicPath}${outputPath}/${fileName}` (note the slashes)
	publicPath: isDevelopment ? `/calypso/${ devTarget }/` : '/calypso/',
	outputPath: 'images/',
	emitFile: false, // On the server side, don't actually copy files
} );

const commitSha = process.env.hasOwnProperty( 'COMMIT_SHA' ) ? process.env.COMMIT_SHA : '(unknown)';

/**
 * This lists modules that must use commonJS `require()`s
 * All modules listed here need to be ES5.
 * @returns {Array} list of externals
 */

function getExternals() {
	return [
		// Don't bundle any node_modules, both to avoid a massive bundle, and problems
		// with modules that are incompatible with webpack bundling.
		nodeExternals( {
			allowlist: [
				// Force all monorepo packages to be bundled. We can guarantee that they are safe
				// to bundle, and can avoid shipping the entire contents of the `packages/` folder
				// (there are symlinks into `packages/` from the `node_modules` folder)
				...packagesInMonorepo().map( ( pkg ) => new RegExp( `^${ pkg.name }(/|$)` ) ),

				// Bundle the `@automattic/number-formatters` package as it comes from Jetpack and
				// is also safe to bundle although it's not a monorepo package.
				/^@automattic\/number-formatters(\/|$)/,

				// bundle the core-js polyfills. We pick only a very small subset of the library
				// to polyfill a few things that are not supported by the latest LTS Node.js,
				// and this avoids shipping the entire library which is fairly big.
				/^core-js\//,

				// Ensure that file-loader files imported from packages in node_modules are
				// _not_ externalized and can be processed by the fileLoader.
				fileLoader.test,

				/^calypso\//,
			],
		} ),
		// Some imports should be resolved to runtime `require()` calls, with paths relative
		// to the path of the `build/server.js` bundle.
		{
			// Don't bundle webpack.config, as it depends on absolute paths (__dirname)
			'calypso/webpack.config': {
				commonjs: '../client/webpack.config.js',
			},
		},
	];
}

const buildDir = path.resolve( 'build' );

const webpackConfig = {
	devtool: 'source-map',
	entry: path.join( __dirname, 'server' ),
	target: 'node',
	output: {
		path: buildDir,
		filename: 'server.js',
		chunkFilename: 'server.[name].js',
	},
	mode: isDevelopment ? 'development' : 'production',
	optimization: {
		concatenateModules: shouldConcatenateModules,
		minimize: false,
	},
	module: {
		rules: [
			{
				include: path.join( __dirname, 'sections.js' ),
				use: {
					loader: path.join( __dirname, '../build-tools/webpack/sections-loader' ),
					options: {
						useRequire: true,
						onlyIsomorphic: true,
						forceAll: ! isDevelopment,
						activeSections: config( 'sections' ),
						enableByDefault: config( 'enable_all_sections' ),
					},
				},
			},
			TranspileConfig.loader( {
				workerCount,
				configFile: path.resolve( 'babel.config.js' ),
				cacheDirectory,
				cacheIdentifier,
				cacheCompression: false,
				exclude: /node_modules\//,
			} ),
			TranspileConfig.loader( {
				workerCount,
				presets: [ require.resolve( '@automattic/calypso-babel-config/presets/dependencies' ) ],
				cacheDirectory,
				cacheIdentifier,
				cacheCompression: false,
				include: shouldTranspileDependency,
			} ),
			fileLoader,
			{
				test: /\.(sc|sa|c)ss$/,
				loader: 'ignore-loader',
			},
		],
	},
	resolve: {
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
		mainFields: [ 'calypso:src', 'module', 'main' ],
		conditionNames: [ 'calypso:src', 'import', 'module', 'require' ],
		alias: {
			'@automattic/calypso-config': 'calypso/server/config',
		},
	},
	node: {
		// Tell webpack we want to supply absolute paths for server code,
		// specifically needed by the client code bundler.
		__filename: true,
		__dirname: true,
	},
	plugins: [
		shouldEmitStats &&
			new BundleAnalyzerPlugin( {
				analyzerMode: 'disabled', // just write the stats.json file
				generateStatsFile: true,
				statsFilename: path.join( __dirname, 'stats-server.json' ),
				statsOptions: {
					source: false,
					reasons: shouldEmitStatsWithReasons,
					optimizationBailout: false,
					chunkOrigins: false,
					chunkGroups: true,
				},
			} ),
		new webpack.ExternalsPlugin( 'commonjs', getExternals() ),
		new webpack.DefinePlugin( {
			'typeof window': JSON.stringify( 'undefined' ),
			BUILD_TIMESTAMP: JSON.stringify( new Date().toISOString() ),
			COMMIT_SHA: JSON.stringify( commitSha ),
			'process.env.NODE_ENV': JSON.stringify( bundleEnv ),
			__i18n_text_domain__: JSON.stringify( 'default' ),
		} ),
		new webpack.IgnorePlugin( { resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ } ),
		! isDevelopment && new ExternalModulesWriter(),
	].filter( Boolean ),
};

module.exports = webpackConfig;
