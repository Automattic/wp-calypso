/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const _ = require( 'lodash' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const AssetsWriter = require( './server/bundler/assets-writer' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const CircularDependencyPlugin = require( 'circular-dependency-plugin' );
const DuplicatePackageCheckerPlugin = require( 'duplicate-package-checker-webpack-plugin' );
const FileConfig = require( '@automattic/calypso-build/webpack/file-loader' );
const MomentTimezoneDataPlugin = require( 'moment-timezone-data-webpack-plugin' );
const InlineConstantExportsPlugin = require( '@automattic/webpack-inline-constant-exports-plugin' );
const Minify = require( '@automattic/calypso-build/webpack/minify' );
const SassConfig = require( '@automattic/calypso-build/webpack/sass' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );
const { cssNameFromFilename } = require( '@automattic/calypso-build/webpack/util' );

/**
 * Internal dependencies
 */
const cacheIdentifier = require( './server/bundler/babel/babel-loader-cache-identifier' );
const config = require( './server/config' );
const { workerCount } = require( './webpack.common' );
const getAliasesForExtensions = require( './config/webpack/extensions' );

/**
 * Internal variables
 */
const calypsoEnv = config( 'env_id' );
const bundleEnv = config( 'env' );
const isDevelopment = bundleEnv !== 'production';
const shouldMinify =
	process.env.MINIFY_JS === 'true' ||
	( process.env.MINIFY_JS !== 'false' && bundleEnv === 'production' && calypsoEnv !== 'desktop' );
const shouldEmitStats = process.env.EMIT_STATS && process.env.EMIT_STATS !== 'false';
const shouldEmitStatsWithReasons = process.env.EMIT_STATS === 'withreasons';
const shouldCheckForCycles = process.env.CHECK_CYCLES === 'true';
const codeSplit = config.isEnabled( 'code-splitting' );
const isCalypsoClient = process.env.BROWSERSLIST_ENV !== 'server';
const isDesktop = calypsoEnv === 'desktop' || calypsoEnv === 'desktop-development';

const defaultBrowserslistEnv = isCalypsoClient && ! isDesktop ? 'evergreen' : 'defaults';
const browserslistEnv = process.env.BROWSERSLIST_ENV || defaultBrowserslistEnv;
const extraPath = browserslistEnv === 'defaults' ? 'fallback' : browserslistEnv;

if ( ! process.env.BROWSERSLIST_ENV ) {
	process.env.BROWSERSLIST_ENV = browserslistEnv;
}

/*
 * Create reporter for ProgressPlugin (used with EMIT_STATS)
 */
function createProgressHandler() {
	const startTime = Date.now();
	let lastShownBuildingMessageTime = null;
	let lastUnshownBuildingMessage = null;

	return ( percentage, msg, ...details ) => {
		const nowTime = Date.now();
		const timeString = ( ( nowTime - startTime ) / 1000 ).toFixed( 1 ) + 's';
		const percentageString = `${ Math.floor( percentage * 100 ) }%`;
		const detailsString = details
			.map( detail => {
				if ( ! detail ) {
					return '';
				}
				if ( detail.length > 40 ) {
					return `…${ detail.substr( detail.length - 39 ) }`;
				}
				return detail;
			} )
			.join( ' ' );
		const message = `${ timeString } ${ percentageString } ${ msg } ${ detailsString }`;

		// There are plenty of 'building' messages that make the log too long for CircleCI web UI.
		// Let's throttle the 'building' messages to one per second, while always showing the last one.
		if ( msg === 'building' ) {
			if ( lastShownBuildingMessageTime && nowTime - lastShownBuildingMessageTime < 1000 ) {
				// less than 1000ms since last message: ignore, but store for case it's the last one
				lastUnshownBuildingMessage = message;
				return;
			}

			// the message will be shown and its time recorded
			lastShownBuildingMessageTime = nowTime;
			lastUnshownBuildingMessage = null;
		} else if ( lastUnshownBuildingMessage ) {
			// The last 'building' message should always be shown, no matter the timing.
			// We do that on the first non-'building' message.
			console.log( lastUnshownBuildingMessage ); // eslint-disable-line no-console
			lastUnshownBuildingMessage = null;
		}

		console.log( message ); // eslint-disable-line no-console
	};
}

const nodeModulesToTranspile = [
	// general form is <package-name>/.
	// The trailing slash makes sure we're not matching these as prefixes
	// In some cases we do want prefix style matching (lodash. for lodash.assign)
	'd3-array/',
	'd3-scale/',
	'debug/',
	'@wordpress/',
	'react-dates',
];
/**
 * Check to see if we should transpile certain files in node_modules
 * @param {String} filepath the path of the file to check
 * @returns {Boolean} True if we should transpile it, false if not
 *
 * We had a thought to try to find the package.json and use the engines property
 * to determine what we should transpile, but not all libraries set engines properly
 * (see d3-array@2.0.0). Instead, we transpile libraries we know to have dropped Node 4 support
 * are likely to remain so going forward.
 */
function shouldTranspileDependency( filepath ) {
	// find the last index of node_modules and check from there
	// we want <working>/node_modules/a-package/node_modules/foo/index.js to only match foo, not a-package
	const marker = '/node_modules/';
	const lastIndex = filepath.lastIndexOf( marker );
	if ( lastIndex === -1 ) {
		// we're not in node_modules
		return false;
	}

	const checkFrom = lastIndex + marker.length;

	return _.some(
		nodeModulesToTranspile,
		modulePart => filepath.substring( checkFrom, checkFrom + modulePart.length ) === modulePart
	);
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

const webpackConfig = {
	bail: ! isDevelopment,
	context: __dirname,
	entry: {
		build: [ path.join( __dirname, 'client', 'boot', 'app' ) ],
		domainsLanding: [ path.join( __dirname, 'client', 'landing', 'domains' ) ],
	},
	mode: isDevelopment ? 'development' : 'production',
	devtool: process.env.SOURCEMAP || ( isDevelopment ? '#eval' : false ),
	output: {
		path: path.join( __dirname, 'public', extraPath ),
		pathinfo: false,
		publicPath: `/calypso/${ extraPath }/`,
		filename: outputFilename,
		chunkFilename: outputChunkFilename,
		devtoolModuleFilenameTemplate: 'app:///[resource-path]',
	},
	optimization: {
		splitChunks: {
			chunks: codeSplit ? 'all' : 'async',
			name: !! ( isDevelopment || shouldEmitStats ),
			maxAsyncRequests: 20,
			maxInitialRequests: 5,
		},
		runtimeChunk: codeSplit ? { name: 'manifest' } : false,
		moduleIds: 'named',
		chunkIds: isDevelopment || shouldEmitStats ? 'named' : 'natural',
		minimize: shouldMinify,
		minimizer: Minify( {
			cache: process.env.CIRCLECI
				? `${ process.env.HOME }/terser-cache/${ extraPath }`
				: 'docker' !== process.env.CONTAINER,
			parallel: workerCount,
			sourceMap: Boolean( process.env.SOURCEMAP ),
			terserOptions: {
				mangle: ! isDesktop,
			},
		} ),
	},
	module: {
		noParse: /[/\\]node_modules[/\\]localforage[/\\]dist[/\\]localforage\.js$/,
		rules: [
			TranspileConfig.loader( {
				workerCount,
				configFile: path.join( __dirname, 'babel.config.js' ),
				cacheDirectory: path.join( __dirname, 'build', '.babel-client-cache', extraPath ),
				cacheIdentifier,
				exclude: /node_modules\//,
			} ),
			TranspileConfig.loader( {
				workerCount,
				configFile: path.resolve( __dirname, 'babel.dependencies.config.js' ),
				cacheDirectory: path.join( __dirname, 'build', '.babel-client-cache', extraPath ),
				cacheIdentifier,
				include: shouldTranspileDependency,
			} ),
			SassConfig.loader( {
				preserveCssCustomProperties: true,
				includePaths: [ path.join( __dirname, 'client' ) ],
				prelude: `@import '${ path.join( __dirname, 'assets/stylesheets/shared/_utils.scss' ) }';`,
			} ),
			{
				include: path.join( __dirname, 'client/sections.js' ),
				loader: path.join( __dirname, 'server', 'bundler', 'sections-loader' ),
				options: {
					include: process.env.SECTION_LIMIT ? process.env.SECTION_LIMIT.split( ',' ) : null,
				},
			},
			{
				test: /\.html$/,
				loader: 'html-loader',
			},
			FileConfig.loader(),
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
		modules: [ path.join( __dirname, 'client' ), 'node_modules' ],
		alias: Object.assign(
			{
				'react-virtualized': 'react-virtualized/dist/es',
				debug: path.resolve( __dirname, 'node_modules/debug' ),
				store: 'store/dist/store.modern',
				gridicons$: path.resolve( __dirname, 'client/components/gridicon' ),
			},
			getAliasesForExtensions( {
				extensionsDirectory: path.join( __dirname, 'client', 'extensions' ),
			} )
		),
	},
	node: false,
	plugins: _.compact( [
		! codeSplit && new webpack.optimize.LimitChunkCountPlugin( { maxChunks: 1 } ),
		new webpack.DefinePlugin( {
			'process.env.NODE_ENV': JSON.stringify( bundleEnv ),
			global: 'window',
		} ),
		new webpack.NormalModuleReplacementPlugin( /^path$/, 'path-browserify' ),
		isCalypsoClient && new webpack.IgnorePlugin( /^\.\/locale$/, /moment$/ ),
		...SassConfig.plugins( {
			chunkFilename: cssChunkFilename,
			filename: cssFilename,
			minify: ! isDevelopment,
		} ),
		isCalypsoClient &&
			new AssetsWriter( {
				filename:
					browserslistEnv === 'defaults'
						? 'assets-fallback.json'
						: `assets-${ browserslistEnv }.json`,
				path: path.join( __dirname, 'server', 'bundler' ),
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
		shouldEmitStats && new webpack.ProgressPlugin( createProgressHandler() ),
		new MomentTimezoneDataPlugin( {
			startYear: 2000,
		} ),
		isCalypsoClient && new InlineConstantExportsPlugin( /\/client\/state\/action-types.js$/ ),
	] ),
	externals: [ 'electron' ],
};

if ( isDevelopment ) {
	webpackConfig.plugins.push( new webpack.HotModuleReplacementPlugin() );
	webpackConfig.entry.build.unshift( 'webpack-hot-middleware/client' );
}

if ( ! config.isEnabled( 'desktop' ) ) {
	webpackConfig.plugins.push(
		new webpack.NormalModuleReplacementPlugin( /^lib[/\\]desktop$/, 'lodash-es/noop' )
	);
}

// List of polyfills that we skip including in the evergreen bundle.
// CoreJS polyfills are automatically dropped using the browserslist definitions; no need to include them here.
const polyfillsSkippedInEvergreen = [
	// Local storage used to throw errors in Safari private mode, but that's no longer the case in Safari >=11.
	/^lib[/\\]local-storage-polyfill$/,
	// The SVG external content polyfill (svg4everybody) isn't needed for evergreen browsers.
	/^svg4everybody$/,
	// The fetch polyfill isn't needed for evergreen browsers, as they all support it.
	/^isomorphic-fetch$/,
];

if ( browserslistEnv === 'evergreen' ) {
	for ( const polyfill of polyfillsSkippedInEvergreen ) {
		webpackConfig.plugins.push(
			new webpack.NormalModuleReplacementPlugin( polyfill, 'lodash-es/noop' )
		);
	}
}

module.exports = webpackConfig;
