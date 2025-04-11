/**
 * WARNING: No ES6 modules here. Not transpiled! *
 */

const path = require( 'path' );
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const Minify = require( '@automattic/calypso-build/webpack/minify' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const {
	cssNameFromFilename,
	shouldTranspileDependency,
} = require( '@automattic/calypso-build/webpack/util' );
const ExtensiveLodashReplacementPlugin = require( '@automattic/webpack-extensive-lodash-replacement-plugin' );
const InlineConstantExportsPlugin = require( '@automattic/webpack-inline-constant-exports-plugin' );
const ReactRefreshWebpackPlugin = require( '@pmmmwh/react-refresh-webpack-plugin' );
const SentryCliPlugin = require( '@sentry/webpack-plugin' );
const autoprefixerPlugin = require( 'autoprefixer' );
const CircularDependencyPlugin = require( 'circular-dependency-plugin' );
const Dotenv = require( 'dotenv-webpack' );
const DuplicatePackageCheckerPlugin = require( 'duplicate-package-checker-webpack-plugin' );
const MomentTimezoneDataPlugin = require( 'moment-timezone-data-webpack-plugin' );
const pkgDir = require( 'pkg-dir' );
const webpack = require( 'webpack' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const cacheIdentifier = require( '../build-tools/babel/babel-loader-cache-identifier' );
const AssetsWriter = require( '../build-tools/webpack/assets-writer-plugin.js' );
const GenerateChunksMapPlugin = require( '../build-tools/webpack/generate-chunks-map-plugin' );
const ReadOnlyCachePlugin = require( '../build-tools/webpack/readonly-cache-plugin' );
const RequireChunkCallbackPlugin = require( '../build-tools/webpack/require-chunk-callback-plugin' );
const config = require( './server/config' );
const { workerCount } = require( './webpack.common' );
/**
 * Internal variables
 */
const bundleEnv = config( 'env' );
const isDevelopment = bundleEnv !== 'production';
const shouldMinify =
	process.env.MINIFY_JS === 'true' ||
	( process.env.MINIFY_JS !== 'false' && bundleEnv === 'production' );
const shouldEmitStats = process.env.EMIT_STATS && process.env.EMIT_STATS !== 'false';
const shouldEmitStatsWithReasons = process.env.EMIT_STATS === 'withreasons';
const shouldCheckForDuplicatePackages = process.env.CHECK_DUPLICATE_PACKAGES === 'true';
const shouldCheckForCycles = process.env.CHECK_CYCLES === 'true';
const shouldConcatenateModules = process.env.CONCATENATE_MODULES !== 'false';
const shouldBuildChunksMap =
	process.env.BUILD_TRANSLATION_CHUNKS === 'true' ||
	process.env.ENABLE_FEATURES === 'use-translation-chunks';
const shouldHotReload = isDevelopment && process.env.CALYPSO_DISABLE_HOT_RELOAD !== 'true';

const defaultBrowserslistEnv = 'evergreen';
const browserslistEnv = process.env.BROWSERSLIST_ENV || defaultBrowserslistEnv;
const extraPath = browserslistEnv === 'defaults' ? 'fallback' : browserslistEnv;
const cachePath = path.resolve( '.cache', extraPath );
const shouldUsePersistentCache = process.env.PERSISTENT_CACHE === 'true';

// NOTE: We reverted some of these changes, but in the future, we will need to avoid
// using the readonly cache again if we generate the cache image inline on trunk.
//
// Readonly cache prevents writing to the cache directory, which is good for performance.
// However, on trunk (and when generating cache images), we want to write to the cache
// so that we can then update the cache to use in subsequent builds. While this costs
// a minute in the current build, an updated cache saves 2 minutes in many future builds.
// Note that in local builds, IS_DEFAULT_BRANCH is not set, in which case we should also write to the cache.
const shouldUseReadonlyCache = ! (
	process.env.GENERATE_CACHE_IMAGE === 'true' || process.env.IS_DEFAULT_BRANCH === undefined
);

const shouldProfile = process.env.PROFILE === 'true';

const shouldCreateSentryRelease =
	( process.env.MANUAL_SENTRY_RELEASE === 'true' || process.env.IS_DEFAULT_BRANCH === 'true' ) &&
	process.env.SENTRY_AUTH_TOKEN?.length > 1;
let sourceMapType = process.env.SOURCEMAP;
if ( ! sourceMapType && shouldCreateSentryRelease ) {
	sourceMapType = 'hidden-source-map';
} else if ( ! sourceMapType && isDevelopment ) {
	sourceMapType = 'eval';
}

if ( shouldCreateSentryRelease ) {
	console.log(
		"A sentry release is being created because the auth token exists and we're either on the trunk branch or the manual checkbox has been toggled."
	);
}

function filterEntrypoints( entrypoints ) {
	if ( ! process.env.ENTRY_LIMIT ) {
		return entrypoints;
	}

	const allowedEntrypoints = process.env.ENTRY_LIMIT.split( ',' );

	console.warn( '[entrylimit] Limiting build to %s', allowedEntrypoints.join( ', ' ) );

	const validEntrypoints = allowedEntrypoints.filter( ( ep ) => {
		if ( entrypoints.hasOwnProperty( ep ) ) {
			return true;
		}
		console.warn( '[entrylimit] Invalid entrypoint: %s. Valid entries are:', ep );
		Object.keys( entrypoints ).forEach( ( e ) => console.warn( '\t' + e ) );
		return false;
	} );

	if ( validEntrypoints.length === 0 ) {
		console.warn( '[entrylimit] No matches found!' );
		throw new Error( 'No valid entrypoints' );
	}

	const allowed = {};
	Object.entries( entrypoints ).forEach( ( [ key, val ] ) => {
		if ( validEntrypoints.includes( key ) ) {
			allowed[ key ] = val;
		}
	} );

	return allowed;
}

/**
 * Given a package name, finds the absolute path for it.
 *
 * require.resolve() will resolve to the main file of the package, using Node's resolution algorithm to find
 * a `package.json` and looking at the field `main`. This function will return the folder that contains `package.json`
 * instead of trying to resolve the main file.
 *
 * Example: `@wordpress/data` may resolve to `/home/myUser/wp-calypso/node_modules/@wordpress/data`.
 *
 * Note this is not the same as looking for `__dirname+'/node_modules/'+pkgName`, as the package may be in a parent
 * `node_modules`
 * @param {string} pkgName Name of the package to search for.
 */
function findPackage( pkgName ) {
	const fullPath = require.resolve( pkgName );
	const packagePath = pkgDir.sync( fullPath );
	return packagePath;
}

if ( ! process.env.BROWSERSLIST_ENV ) {
	process.env.BROWSERSLIST_ENV = browserslistEnv;
}

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

const fileLoader = FileConfig.loader(
	// The server bundler express middleware serves assets from a hard-coded publicPath.
	// This is required so that running calypso via `yarn start` doesn't break.
	// The final URL of the image is `${publichPath}${outputPath}/${fileName}` (note the slashes)
	isDevelopment
		? {
				publicPath: `/calypso/${ extraPath }/`,
				outputPath: 'images/',
		  }
		: {
				// Build off `outputPath` for a result like `/…/public/evergreen/../images/`.
				publicPath: '/calypso/images/',
				outputPath: '../images/',
		  }
);

const filePaths = {
	path: path.join( outputDir, 'public', extraPath ),
	publicPath: `/calypso/${ extraPath }/`,
};

const webpackConfig = {
	bail: ! isDevelopment,
	context: __dirname,
	entry: filterEntrypoints( {
		'entry-main': [ path.join( __dirname, 'boot', 'app' ) ],
		'entry-domains-landing': [ path.join( __dirname, 'landing', 'domains' ) ],
		'entry-login': [ path.join( __dirname, 'landing', 'login' ) ],
		'entry-stepper': [ path.join( __dirname, 'landing', 'stepper' ) ],
		'entry-browsehappy': [ path.join( __dirname, 'landing', 'browsehappy' ) ],
		'entry-subscriptions': [ path.join( __dirname, 'landing', 'subscriptions' ) ],
		'entry-dashboard-dotcom': [ path.join( __dirname, 'dashboard', 'app-dotcom' ) ],
		'entry-dashboard-a4a': [ path.join( __dirname, 'dashboard', 'app-a4a' ) ],
		'entry-reauth-required': [ path.join( __dirname, 'reauth-required', 'bundle' ) ],
	} ),
	mode: isDevelopment ? 'development' : 'production',
	devtool: sourceMapType,
	output: {
		...filePaths,
		pathinfo: false,
		filename: outputFilename,
		chunkFilename: outputChunkFilename,
		devtoolModuleFilenameTemplate: 'app:///[resource-path]',
	},
	optimization: {
		concatenateModules: ! isDevelopment && shouldConcatenateModules,
		removeAvailableModules: true,
		removeEmptyChunks: true,
		splitChunks: {
			chunks: 'all',
			...( isDevelopment || shouldEmitStats ? {} : { name: false } ),
			maxAsyncRequests: 20,
			maxInitialRequests: 5,
		},
		runtimeChunk: { name: 'runtime' },
		moduleIds: 'named',
		chunkIds: isDevelopment || shouldEmitStats ? 'named' : 'deterministic',
		minimize: shouldMinify,
		minimizer: Minify(),
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
				plugins: shouldHotReload ? [ require.resolve( 'react-refresh/babel' ) ] : [],
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
				// Since `prelude` string will be appended to each Sass file
				// We need to ensure that the import path (inside a sass file) is a posix path, regardless of the OS/platform
				// Final result should be something like `@use 'client/assets/stylesheets/shared/_utils.scss' as *;`
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
			{
				include: path.join( __dirname, 'sections.js' ),
				loader: path.join( __dirname, '../build-tools/webpack/sections-loader' ),
				options: {
					include: process.env.SECTION_LIMIT ? process.env.SECTION_LIMIT.split( ',' ) : null,
					forceAll: ! isDevelopment,
					activeSections: config( 'sections' ),
					enableByDefault: config( 'enable_all_sections' ),
				},
			},
			{
				test: /\.html$/,
				loader: 'html-loader',
			},
			fileLoader,
		],
	},
	resolve: {
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
		mainFields: [ 'browser', 'calypso:src', 'module', 'main' ],
		conditionNames: [ 'calypso:src', 'import', 'module', 'require' ],
		alias: Object.assign( {
			debug: path.resolve( __dirname, '../node_modules/debug' ),
			store: 'store/dist/store.modern',
			// By using the path of the package we let Webpack parse the package's `package.json`
			// and use `mainFields` to decide what is the main file.
			'@wordpress/data': findPackage( '@wordpress/data' ),
			'@wordpress/i18n': findPackage( '@wordpress/i18n' ),
			// Alias calypso to ./client. This allows for smaller bundles, as it ensures that
			// importing `./client/file.js` is the same thing than importing `calypso/file.js`
			calypso: __dirname,

			util: findPackage( 'util/' ), //Trailing `/` stops node from resolving it to the built-in module
		} ),
		fallback: {
			stream: require.resolve( 'stream-browserify' ),
		},
	},
	node: false,
	plugins: [
		new Dotenv(),
		new webpack.DefinePlugin( {
			'typeof window': JSON.stringify( 'object' ),
			'process.env.NODE_ENV': JSON.stringify( bundleEnv ),
			'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			'process.env.GUTENBERG_PHASE': JSON.stringify( 1 ),
			'process.env.COMPONENT_SYSTEM_PHASE': JSON.stringify( 0 ),
			'process.env.FORCE_REDUCED_MOTION': JSON.stringify(
				!! process.env.FORCE_REDUCED_MOTION || false
			),
			__i18n_text_domain__: JSON.stringify( 'default' ),
			fingerprintJsVersion: JSON.stringify(
				require( '../packages/fingerprintjs/package.json' ).version
			),
			global: 'window',
		} ),
		// Node polyfills
		new webpack.ProvidePlugin( {
			process: 'process/browser.js',
		} ),
		new webpack.NormalModuleReplacementPlugin( /^path$/, 'path-browserify' ),
		new webpack.IgnorePlugin( { resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ } ),
		...SassConfig.plugins( {
			chunkFilename: cssChunkFilename,
			filename: cssFilename,
		} ),
		new AssetsWriter( {
			filename: `assets.json`,
			path: path.join( outputDir, 'build' ),
		} ),
		shouldCheckForDuplicatePackages && new DuplicatePackageCheckerPlugin(),
		shouldCheckForCycles &&
			new CircularDependencyPlugin( {
				exclude: /node_modules/,
				failOnError: false,
				allowAsyncCycles: false,
				cwd: process.cwd(),
			} ),
		shouldEmitStats &&
			new BundleAnalyzerPlugin( {
				analyzerMode: 'disabled', // just write the stats.json file
				generateStatsFile: true,
				statsFilename: path.join( __dirname, 'stats.json' ),
				statsOptions: {
					source: false,
					reasons: shouldEmitStatsWithReasons,
					optimizationBailout: false,
					chunkOrigins: false,
					chunkGroups: true,
				},
			} ),
		new MomentTimezoneDataPlugin( {
			startYear: 2000,
			endYear: 2030,
			cacheDir: path.resolve( cachePath, 'moment-timezone' ),
		} ),
		new InlineConstantExportsPlugin( /\/client\/state\/action-types.js$/ ),
		shouldBuildChunksMap &&
			new GenerateChunksMapPlugin( {
				output: path.resolve( './public/chunks-map.json' ),
			} ),
		new RequireChunkCallbackPlugin(),
		/*
		 * ExPlat: Don't import the server logger when we are in the browser
		 */
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/server\/lib\/logger$/,
			'calypso/lib/explat/internals/logger-browser-replacement'
		),
		/*
		 * Forcibly remove dashicon while we wait for better tree-shaking in `@wordpress/*`.
		 */
		new webpack.NormalModuleReplacementPlugin( /dashicon/, ( res ) => {
			if ( res.context.includes( '@wordpress/components/' ) ) {
				res.request = 'calypso/components/empty-component';
			}
		} ),
		/*
		 * Local storage used to throw errors in Safari private mode, but that's no longer the case in Safari >=11.
		 */
		...( browserslistEnv === 'evergreen'
			? [
					new webpack.NormalModuleReplacementPlugin(
						/^calypso[/\\]lib[/\\]local-storage-polyfill$/,
						'lodash-es/noop'
					),
			  ]
			: [] ),

		/*
		 * Replace `lodash` with `lodash-es`
		 */
		new ExtensiveLodashReplacementPlugin(),

		// Equivalent to the CLI flag --progress=profile
		shouldProfile && new webpack.ProgressPlugin( { profile: true } ),

		shouldUsePersistentCache && shouldUseReadonlyCache && new ReadOnlyCachePlugin(),

		// NOTE: Sentry should be the last webpack plugin in the array.
		shouldCreateSentryRelease &&
			new SentryCliPlugin( {
				org: 'a8c',
				project: 'calypso',
				authToken: process.env.SENTRY_AUTH_TOKEN,
				release: `calypso_${ process.env.COMMIT_SHA }`,
				include: filePaths.path,
				urlPrefix: `~${ filePaths.publicPath }`,
				errorHandler: ( err, invokeErr, compilation ) => {
					// Sentry should _never_ fail the webpack build, so only emit warnings here:
					compilation.warnings.push( 'Sentry CLI Plugin: ' + err.message );
				},
			} ),
		shouldHotReload && new webpack.HotModuleReplacementPlugin(),
		shouldHotReload &&
			new ReactRefreshWebpackPlugin( {
				overlay: false,
				exclude: [ /node_modules/, /devdocs/ ],
			} ),
	].filter( Boolean ),
	externals: [ 'keytar' ],

	...( shouldUsePersistentCache
		? {
				cache: {
					type: 'filesystem',
					buildDependencies: {
						config: [ __filename ],
					},
					cacheDirectory: path.resolve( cachePath, 'webpack' ),
					profile: true,
					version: [
						// No need to add BROWSERSLIST, as it is already part of the cacheDirectory
						shouldBuildChunksMap,
						shouldMinify,
						process.env.ENTRY_LIMIT,
						process.env.SECTION_LIMIT,
						process.env.NODE_ENV,
						process.env.CALYPSO_ENV,
					].join( '-' ),
				},
				infrastructureLogging: {
					debug: /webpack\.cache/,
				},
				snapshot: {
					managedPaths: [
						path.resolve( __dirname, '../node_modules' ),
						path.resolve( __dirname, 'node_modules' ),
					],
				},
		  }
		: {} ),

	experiments: {
		backCompat: false,
	},
};

module.exports = webpackConfig;
