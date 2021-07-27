/**
 * WARNING: No ES6 modules here. Not transpiled! *
 */

/* eslint-disable import/no-nodejs-modules */

const path = require( 'path' );
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const Minify = require( '@automattic/calypso-build/webpack/minify' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const {
	cssNameFromFilename,
	shouldTranspileDependency,
} = require( '@automattic/calypso-build/webpack/util' );
const calypsoColorSchemes = require( '@automattic/calypso-color-schemes/js' );
const ExtensiveLodashReplacementPlugin = require( '@automattic/webpack-extensive-lodash-replacement-plugin' );
const InlineConstantExportsPlugin = require( '@automattic/webpack-inline-constant-exports-plugin' );
const autoprefixerPlugin = require( 'autoprefixer' );
const CircularDependencyPlugin = require( 'circular-dependency-plugin' );
const DuplicatePackageCheckerPlugin = require( 'duplicate-package-checker-webpack-plugin' );
const MomentTimezoneDataPlugin = require( 'moment-timezone-data-webpack-plugin' );
const pkgDir = require( 'pkg-dir' );
const postcssCustomPropertiesPlugin = require( 'postcss-custom-properties' );
const webpack = require( 'webpack' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const cacheIdentifier = require( '../build-tools/babel/babel-loader-cache-identifier' );
const AssetsWriter = require( '../build-tools/webpack/assets-writer-plugin.js' );
const getAliasesForExtensions = require( '../build-tools/webpack/extensions' );
const GenerateChunksMapPlugin = require( '../build-tools/webpack/generate-chunks-map-plugin' );
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

const defaultBrowserslistEnv = 'evergreen';
const browserslistEnv = process.env.BROWSERSLIST_ENV || defaultBrowserslistEnv;
const extraPath = browserslistEnv === 'defaults' ? 'fallback' : browserslistEnv;
const cachePath = path.resolve( '.cache', extraPath );
const shouldUsePersistentCache = process.env.PERSISTENT_CACHE === 'true';
const shouldProfile = process.env.PROFILE === 'true';

function filterEntrypoints( entrypoints ) {
	/* eslint-disable no-console */
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
	/* eslint-enable no-console */
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
 *
 * @param {string} pkgName Name of the package to search for
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
				emitFile: browserslistEnv === defaultBrowserslistEnv, // Only output files once.
		  }
);

const webpackConfig = {
	bail: ! isDevelopment,
	context: __dirname,
	entry: filterEntrypoints( {
		'entry-main': [ path.join( __dirname, 'boot', 'app' ) ],
		'entry-domains-landing': [ path.join( __dirname, 'landing', 'domains' ) ],
		'entry-login': [ path.join( __dirname, 'landing', 'login' ) ],
		'entry-gutenboarding': [ path.join( __dirname, 'landing', 'gutenboarding' ) ],
	} ),
	mode: isDevelopment ? 'development' : 'production',
	devtool: process.env.SOURCEMAP || ( isDevelopment ? 'eval' : false ),
	output: {
		path: path.join( outputDir, 'public', extraPath ),
		pathinfo: false,
		publicPath: `/calypso/${ extraPath }/`,
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
		minimizer: Minify( {
			parallel: workerCount,
			// Note: terserOptions will override (Object.assign) default terser options in packages/calypso-build/webpack/minify.js
			terserOptions: {
				compress: true,
				mangle: true,
			},
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
				presets: [ require.resolve( '@automattic/calypso-build/babel/dependencies' ) ],
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
					plugins: [
						autoprefixerPlugin(),
						browserslistEnv === 'defaults' &&
							postcssCustomPropertiesPlugin( { importFrom: [ calypsoColorSchemes ] } ),
					].filter( Boolean ),
				},
				prelude: `@import '${ path.join( __dirname, 'assets/stylesheets/shared/_utils.scss' ) }';`,
				...( shouldUsePersistentCache
					? {}
					: {
							cacheDirectory: path.resolve( cachePath, 'css-loader' ),
					  } ),
			} ),
			{
				include: path.join( __dirname, 'sections.js' ),
				loader: path.join( __dirname, '../build-tools/webpack/sections-loader' ),
				options: {
					include: process.env.SECTION_LIMIT ? process.env.SECTION_LIMIT.split( ',' ) : null,
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
		alias: Object.assign(
			{
				debug: path.resolve( __dirname, '../node_modules/debug' ),
				store: 'store/dist/store.modern',
				gridicons$: path.resolve( __dirname, 'components/gridicon' ),
				// By using the path of the package we let Webpack parse the package's `package.json`
				// and use `mainFields` to decide what is the main file.
				'@wordpress/data': findPackage( '@wordpress/data' ),
				'@wordpress/i18n': findPackage( '@wordpress/i18n' ),
				// Alias calypso to ./client. This allows for smaller bundles, as it ensures that
				// importing `./client/file.js` is the same thing than importing `calypso/file.js`
				calypso: __dirname,

				// Node polyfills
				process: 'process/browser',
				util: findPackage( 'util/' ), //Trailing `/` stops node from resolving it to the built-in module
			},
			getAliasesForExtensions( {
				extensionsDirectory: path.resolve( __dirname, 'extensions' ),
			} )
		),
	},
	node: false,
	plugins: [
		new webpack.DefinePlugin( {
			'process.env.NODE_ENV': JSON.stringify( bundleEnv ),
			'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			'process.env.GUTENBERG_PHASE': JSON.stringify( 1 ),
			'process.env.COMPONENT_SYSTEM_PHASE': JSON.stringify( 0 ),
			'process.env.FORCE_REDUCED_MOTION': JSON.stringify(
				!! process.env.FORCE_REDUCED_MOTION || false
			),
			__i18n_text_domain__: JSON.stringify( 'default' ),
			global: 'window',
		} ),
		new webpack.ProvidePlugin( {
			process: 'process/browser',
		} ),
		new webpack.NormalModuleReplacementPlugin( /^path$/, 'path-browserify' ),
		new webpack.IgnorePlugin( { resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ } ),
		...SassConfig.plugins( {
			chunkFilename: cssChunkFilename,
			filename: cssFilename,
			minify: ! isDevelopment,
		} ),
		new AssetsWriter( {
			filename: `assets-${ browserslistEnv === 'defaults' ? 'fallback' : browserslistEnv }.json`,
			path: path.join( outputDir, 'build' ),
			assetExtraPath: extraPath,
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
			cacheDir: path.resolve( cachePath, 'moment-timezone' ),
		} ),
		new InlineConstantExportsPlugin( /\/client\/state\/action-types.js$/ ),
		shouldBuildChunksMap &&
			new GenerateChunksMapPlugin( {
				output: path.resolve( '.', `chunks-map.${ extraPath }.json` ),
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
		 * Use "evergreen" polyfill config, rather than fallback.
		 */
		browserslistEnv === 'evergreen' &&
			new webpack.NormalModuleReplacementPlugin(
				/^@automattic\/calypso-polyfills$/,
				'@automattic/calypso-polyfills/browser-evergreen'
			),
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
						process.env.SOURCEMAP,
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
};

module.exports = webpackConfig;
