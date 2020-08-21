/**
 * **** WARNING: No ES6 modules here. Not transpiled! ****
 */

/* eslint import/no-extraneous-dependencies: [ "error", { packageDir: __dirname/.. } ] */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const path = require( 'path' );
const fs = require( 'fs' );
const webpack = require( 'webpack' );
const AssetsWriter = require( './server/bundler/assets-writer' );
const ConfigFlagPlugin = require( '@automattic/webpack-config-flag-plugin' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const CircularDependencyPlugin = require( 'circular-dependency-plugin' );
const DuplicatePackageCheckerPlugin = require( 'duplicate-package-checker-webpack-plugin' );
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const MomentTimezoneDataPlugin = require( 'moment-timezone-data-webpack-plugin' );
const InlineConstantExportsPlugin = require( '@automattic/webpack-inline-constant-exports-plugin' );
const Minify = require( '@automattic/calypso-build/webpack/minify' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const calypsoColorSchemes = require( '@automattic/calypso-color-schemes/js' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const {
	cssNameFromFilename,
	IncrementalProgressPlugin,
	shouldTranspileDependency,
} = require( '@automattic/calypso-build/webpack/util' );
const ExtensiveLodashReplacementPlugin = require( '@automattic/webpack-extensive-lodash-replacement-plugin' );
const autoprefixerPlugin = require( 'autoprefixer' );
const postcssCustomPropertiesPlugin = require( 'postcss-custom-properties' );

/**
 * Internal dependencies
 */
const cacheIdentifier = require( './server/bundler/babel/babel-loader-cache-identifier' );
const config = require( './server/config' );
const { workerCount } = require( './webpack.common' );
const getAliasesForExtensions = require( './webpack-utils/extensions' );
const RequireChunkCallbackPlugin = require( './webpack-utils/require-chunk-callback-plugin' );
const GenerateChunksMapPlugin = require( './webpack-utils/generate-chunks-map-plugin' );

/**
 * Internal variables
 */
const calypsoEnv = config( 'env_id' );
const bundleEnv = config( 'env' );
const isDevelopment = bundleEnv !== 'production';
const shouldMinify =
	process.env.MINIFY_JS === 'true' ||
	( process.env.MINIFY_JS !== 'false' && bundleEnv === 'production' );
const shouldEmitStats = process.env.EMIT_STATS && process.env.EMIT_STATS !== 'false';
const shouldShowProgress = process.env.PROGRESS && process.env.PROGRESS !== 'false';
const shouldEmitStatsWithReasons = process.env.EMIT_STATS === 'withreasons';
const shouldCheckForCycles = process.env.CHECK_CYCLES === 'true';
const shouldConcatenateModules = process.env.CONCATENATE_MODULES !== 'false';
const shouldBuildChunksMap =
	process.env.BUILD_TRANSLATION_CHUNKS === 'true' ||
	process.env.ENABLE_FEATURES === 'use-translation-chunks';
const isDesktop = calypsoEnv === 'desktop' || calypsoEnv === 'desktop-development';
const isDesktopMonorepo = isDesktop && process.env.DESKTOP_MONOREPO === 'true';

const defaultBrowserslistEnv = isDesktop ? 'defaults' : 'evergreen';
const browserslistEnv = process.env.BROWSERSLIST_ENV || defaultBrowserslistEnv;
const extraPath = browserslistEnv === 'defaults' ? 'fallback' : browserslistEnv;
const cachePath = path.resolve( '.cache', extraPath );
const hasLanguagesMeta = fs.existsSync(
	path.join( __dirname, 'languages', 'languages-meta.json' )
);

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

if ( ! process.env.BROWSERSLIST_ENV ) {
	process.env.BROWSERSLIST_ENV = browserslistEnv;
}

let outputFilename = '[name].[chunkhash].min.js'; // prefer the chunkhash, which depends on the chunk, not the entire build
let outputChunkFilename = '[name].[chunkhash].min.js'; // ditto

// we should not use chunkhash in development: https://github.com/webpack/webpack-dev-server/issues/377#issuecomment-241258405
// also we don't minify so dont name them .min.js
//
// Desktop: no chunks or dll here, just one big file for the desktop app
if ( isDevelopment || isDesktop ) {
	outputFilename = '[name].js';
	outputChunkFilename = '[name].js';
}

const cssFilename = cssNameFromFilename( outputFilename );
const cssChunkFilename = cssNameFromFilename( outputChunkFilename );

const outputDir = path.resolve( isDesktopMonorepo ? './desktop' : '.' );

const fileLoader = FileConfig.loader(
	// The server bundler express middleware serves assets from a hard-coded publicPath.
	// This is required so that running calypso via `yarn start` doesn't break.
	isDevelopment
		? {
				outputPath: 'images',
				publicPath: `/calypso/${ extraPath }/images/`,
				esModules: true,
		  }
		: {
				// File-loader does not understand absolute paths so __dirname won't work.
				// Build off `output.path` for a result like `/…/public/evergreen/../images/`.
				outputPath: path.join( '..', 'images' ),
				publicPath: '/calypso/images/',
				emitFile: browserslistEnv === defaultBrowserslistEnv, // Only output files once.
				esModules: true,
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
	devtool: process.env.SOURCEMAP || ( isDevelopment ? '#eval' : false ),
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
		// Desktop: override removeAvailableModules and removeEmptyChunks to minimize resource/RAM usage.
		removeAvailableModules: ! isDesktop,
		removeEmptyChunks: ! isDesktop,
		splitChunks: {
			chunks: 'all',
			name: !! ( isDevelopment || shouldEmitStats ),
			maxAsyncRequests: 20,
			maxInitialRequests: 5,
		},
		runtimeChunk: isDesktop ? false : { name: 'manifest' },
		moduleIds: 'named',
		chunkIds: isDevelopment || shouldEmitStats ? 'named' : 'natural',
		minimize: shouldMinify,
		minimizer: Minify( {
			cache: process.env.CIRCLECI
				? `${ process.env.HOME }/terser-cache/${ extraPath }`
				: 'docker' !== process.env.CONTAINER,
			// Desktop: number of workers should *not* exceed # of vCPUs available.
			// For both medium Machine and Docker images, number of vCPUs == 2.
			// Ref: https://support.circleci.com/hc/en-us/articles/360038192673-NodeJS-Builds-or-Test-Suites-Fail-With-ENOMEM-or-a-Timeout
			parallel: isDesktop ? 2 : workerCount,
			// Desktop: disable sourceMaps for performance
			sourceMap: isDesktop ? false : Boolean( process.env.SOURCEMAP ),
			// Note: terserOptions will override (Object.assign) default terser options in packages/calypso-build/webpack/minify.js
			terserOptions: {
				...( isDesktop
					? {
							ecma: 2017,
							mangle: true,
							compress: false,
							safari10: false,
					  }
					: {
							mangle: true,
					  } ),
			},
		} ),
	},
	module: {
		strictExportPresence: true,
		rules: [
			TranspileConfig.loader( {
				workerCount,
				configFile: path.resolve( 'babel.config.js' ),
				cacheDirectory: path.resolve( 'build', '.babel-client-cache', extraPath ),
				cacheIdentifier,
				exclude: /node_modules\//,
			} ),
			TranspileConfig.loader( {
				workerCount,
				presets: [ require.resolve( '@automattic/calypso-build/babel/dependencies' ) ],
				cacheDirectory: path.resolve( 'build', '.babel-client-cache', extraPath ),
				cacheIdentifier,
				include: shouldTranspileDependency,
			} ),
			SassConfig.loader( {
				includePaths: [ __dirname ],
				postCssOptions: {
					plugins: () =>
						[
							autoprefixerPlugin(),
							browserslistEnv === 'defaults' &&
								postcssCustomPropertiesPlugin( {
									importFrom: [ calypsoColorSchemes ],
								} ),
						].filter( Boolean ),
				},
				prelude: `@import '${ path.join( __dirname, 'assets/stylesheets/shared/_utils.scss' ) }';`,
				cacheDirectory: path.resolve( cachePath, 'css-loader' ),
			} ),
			{
				include: path.join( __dirname, 'sections.js' ),
				loader: path.join( __dirname, 'server', 'bundler', 'sections-loader' ),
				options: {
					include: process.env.SECTION_LIMIT ? process.env.SECTION_LIMIT.split( ',' ) : null,
				},
			},
			{
				test: /\.html$/,
				loader: 'html-loader',
			},
			fileLoader,
			{
				include: require.resolve( 'tinymce/tinymce' ),
				use: 'exports-loader?window=tinymce',
			},
			{
				test: /node_modules[/\\]tinymce/,
				use: 'imports-loader?this=>window',
			},
		],
	},
	resolve: {
		extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
		modules: [ __dirname, 'node_modules' ],
		alias: Object.assign(
			{
				debug: path.resolve( __dirname, '../node_modules/debug' ),
				store: 'store/dist/store.modern',
				gridicons$: path.resolve( __dirname, 'components/gridicon' ),
				'@wordpress/data': require.resolve( '@wordpress/data' ),
				'@wordpress/i18n': require.resolve( '@wordpress/i18n' ),
				// Alias wp-calypso-client to ./client. This allows for smaller bundles, as it ensures that
				// importing `./client/file.js` is the same thing than importing `wp-calypso-client/file.js`
				'wp-calypso-client': __dirname,
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
			'process.env.GUTENBERG_PHASE': JSON.stringify( 1 ),
			'process.env.FORCE_REDUCED_MOTION': JSON.stringify(
				!! process.env.FORCE_REDUCED_MOTION || false
			),
			global: 'window',
		} ),
		new webpack.NormalModuleReplacementPlugin( /^path$/, 'path-browserify' ),
		new webpack.IgnorePlugin( /^\.\/locale$/, /moment$/ ),
		...SassConfig.plugins( {
			chunkFilename: cssChunkFilename,
			filename: cssFilename,
			minify: ! isDevelopment,
		} ),
		new AssetsWriter( {
			filename: `assets-${ browserslistEnv === 'defaults' ? 'fallback' : browserslistEnv }.json`,
			path: path.join( outputDir, 'client', 'server', 'bundler' ),
			assetExtraPath: extraPath,
		} ),
		new DuplicatePackageCheckerPlugin(),
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
		shouldShowProgress && new IncrementalProgressPlugin(),
		new MomentTimezoneDataPlugin( {
			startYear: 2000,
			cacheDir: path.resolve( 'build', '.moment-timezone-data-webpack-plugin-cache', extraPath ),
		} ),
		new ConfigFlagPlugin( {
			flags: { desktop: config.isEnabled( 'desktop' ) },
		} ),
		new InlineConstantExportsPlugin( /\/client\/state\/action-types.js$/ ),
		shouldBuildChunksMap &&
			new GenerateChunksMapPlugin( {
				output: path.resolve( '.', `chunks-map.${ extraPath }.json` ),
			} ),
		new RequireChunkCallbackPlugin(),
		isDevelopment && new webpack.HotModuleReplacementPlugin(),
		...( ! config.isEnabled( 'desktop' )
			? [
					new webpack.NormalModuleReplacementPlugin( /^lib[/\\]desktop$/, 'lodash-es/noop' ),
					new webpack.NormalModuleReplacementPlugin(
						/^wp-calypso-client[/\\]lib[/\\]desktop$/,
						'lodash/noop'
					),
			  ]
			: [] ),
		/*
		 * Forcibly remove dashicon while we wait for better tree-shaking in `@wordpress/*`.
		 */
		new webpack.NormalModuleReplacementPlugin( /dashicon/, ( res ) => {
			if ( res.context.includes( '@wordpress/components/' ) ) {
				res.request = 'components/empty-component';
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
						/^lib[/\\]local-storage-polyfill$/,
						'lodash-es/noop'
					),
					new webpack.NormalModuleReplacementPlugin(
						/^wp-calypso-client[/\\]lib[/\\]local-storage-polyfill$/,
						'lodash-es/noop'
					),
			  ]
			: [] ),

		/*
		 * When not available, replace languages-meta.json with fallback-languages-meta.json.
		 */
		hasLanguagesMeta &&
			new webpack.NormalModuleReplacementPlugin(
				/^languages[/\\]fallback-languages-meta.json$/,
				'languages/languages-meta.json'
			),
		/*
		 * Replace `lodash` with `lodash-es`
		 */
		new ExtensiveLodashReplacementPlugin(),
	].filter( Boolean ),
	externals: [ 'electron' ],
};

module.exports = webpackConfig;
