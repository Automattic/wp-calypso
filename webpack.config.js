/** @format */
/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const _ = require( 'lodash' );
const fs = require( 'fs' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const AssetsWriter = require( './server/bundler/assets-writer' );
const MiniCssExtractPluginWithRTL = require( 'mini-css-extract-plugin-with-rtl' );
const WebpackRTLPlugin = require( 'webpack-rtl-plugin' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const CircularDependencyPlugin = require( 'circular-dependency-plugin' );
const os = require( 'os' );
const DuplicatePackageCheckerPlugin = require( 'duplicate-package-checker-webpack-plugin' );

/**
 * Internal dependencies
 */
const cacheIdentifier = require( './server/bundler/babel/babel-loader-cache-identifier' );
const config = require( './server/config' );

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
const shouldEmitStatsWithReasons = process.env.EMIT_STATS === 'withreasons';
const shouldCheckForCycles = process.env.CHECK_CYCLES === 'true';
const codeSplit = config.isEnabled( 'code-splitting' );
const isCalypsoClient = process.env.CALYPSO_CLIENT === 'true';

const workerCount = +process.env.WORKERS || Math.max( 2, Math.floor( os.cpus().length / 2 ) );

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

// Disable unsafe cssnano optimizations like renaming animations or rebasing z-indexes. These
// optimizations don't work across independently minified stylesheets. As we minify each webpack
// CSS chunk individually and then load multiple chunks into one document, the optimized names
// conflict with each other, e.g., multiple animations named `a` or z-indexes starting from 1.
// TODO: upgrade cssnano from v3 to v4. In v3, all optimizations, including unsafe ones, run by
// default and need to be disabled explicitly as we do here. In v4, there is a new concept of
// 'presets' and unsafe optimizations are opt-in rather than opt-out. The `default` preset enables
// only the safe ones. https://cssnano.co/guides/optimisations
const cssnanoOptions = {
	autoprefixer: false,
	discardUnused: false,
	mergeIdents: false,
	reduceIdents: false,
	zindex: false,
};

/**
 * This function scans the /client/extensions directory in order to generate a map that looks like this:
 * {
 *   sensei: 'absolute/path/to/wp-calypso/client/extensions/sensei',
 *   woocommerce: 'absolute/path/to/wp-calypso/client/extensions/woocommerce',
 *   ....
 * }
 *
 * Providing webpack with these aliases instead of telling it to scan client/extensions for every
 * module resolution speeds up builds significantly.
 * @returns {Object} a mapping of extension name to path
 */
function getAliasesForExtensions() {
	const extensionsDirectory = path.join( __dirname, 'client', 'extensions' );
	const extensionsNames = fs
		.readdirSync( extensionsDirectory )
		.filter( filename => filename.indexOf( '.' ) === -1 ); // heuristic for finding directories

	const aliasesMap = {};
	extensionsNames.forEach(
		extensionName =>
			( aliasesMap[ extensionName ] = path.join( extensionsDirectory, extensionName ) )
	);
	return aliasesMap;
}

/**
 * Converts @wordpress require into window reference
 *
 * Note this isn't the same as camel case because of the
 * way that numbers don't trigger the capitalized next letter
 *
 * @example
 * wordpressRequire( '@wordpress/api-fetch' ) = 'wp.apiFetch'
 * wordpressRequire( '@wordpress/i18n' ) = 'wp.i18n'
 *
 * @param {string} request import name
 * @return {string} global variable reference for import
 */
const wordpressRequire = request => {
	// @wordpress/components -> [ @wordpress, components ]
	const [ , name ] = request.split( '/' );

	// components -> wp.components
	return `wp.${ name.replace( /-([a-z])/g, ( match, letter ) => letter.toUpperCase() ) }`;
};

const wordpressExternals = ( context, request, callback ) =>
	/^@wordpress\//.test( request )
		? callback( null, `root ${ wordpressRequire( request ) }` )
		: callback();

/**
 * Return a webpack config object
 *
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 *
 * @param {object}  env                              additional config options
 * @param {boolean} env.externalizeWordPressPackages whether to bundle or extern the `@wordpress/` packages
 *
 * @return {object}                                  webpack config
 */
function getWebpackConfig( { cssFilename, externalizeWordPressPackages = false } = {} ) {
	cssFilename =
		cssFilename ||
		( isDevelopment || calypsoEnv === 'desktop' ? '[name].css' : '[name].[chunkhash].css' );

	const webpackConfig = {
		bail: ! isDevelopment,
		context: __dirname,
		entry: { build: [ path.join( __dirname, 'client', 'boot', 'app' ) ] },
		mode: isDevelopment ? 'development' : 'production',
		devtool: process.env.SOURCEMAP || ( isDevelopment ? '#eval' : false ),
		output: {
			path: path.join( __dirname, 'public' ),
			publicPath: '/calypso/',
			filename: '[name].[chunkhash].min.js', // prefer the chunkhash, which depends on the chunk, not the entire build
			chunkFilename: '[name].[chunkhash].min.js', // ditto
			devtoolModuleFilenameTemplate: 'app:///[resource-path]',
		},
		optimization: {
			splitChunks: {
				chunks: codeSplit ? 'all' : 'async',
				name: isDevelopment || shouldEmitStats,
				maxAsyncRequests: 20,
				maxInitialRequests: 5,
			},
			runtimeChunk: codeSplit ? { name: 'manifest' } : false,
			moduleIds: 'named',
			chunkIds: isDevelopment ? 'named' : 'natural',
			minimize: shouldMinify,
			minimizer: [
				new TerserPlugin( {
					cache: process.env.CIRCLECI
						? `${ process.env.HOME }/terser-cache`
						: 'docker' !== process.env.CONTAINER,
					parallel: process.env.CIRCLECI ? 2 : workerCount,
					sourceMap: Boolean( process.env.SOURCEMAP ),
					terserOptions: {
						ecma: 5,
						safari10: true,
					},
				} ),
			],
		},
		module: {
			// avoids this warning:
			// https://github.com/localForage/localForage/issues/577
			noParse: /[\/\\]node_modules[\/\\]localforage[\/\\]dist[\/\\]localforage\.js$/,
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules\//,
					use: [
						{
							loader: 'thread-loader',
							options: {
								workers: process.env.CIRCLECI ? 2 : workerCount,
							},
						},
						{
							loader: 'babel-loader',
							options: {
								configFile: path.resolve( __dirname, 'babel.config.js' ),
								babelrc: false,
								cacheDirectory: path.join( __dirname, 'build', '.babel-client-cache' ),
								cacheIdentifier,
							},
						},
					],
				},
				{
					test: /node_modules[\/\\](redux-form|react-redux)[\/\\]es/,
					loader: 'babel-loader',
					options: {
						babelrc: false,
						plugins: [ path.join( __dirname, 'server', 'bundler', 'babel', 'babel-lodash-es' ) ],
					},
				},
				{
					test: /\.(sc|sa|c)ss$/,
					use: [
						MiniCssExtractPluginWithRTL.loader,
						'css-loader',
						{
							loader: 'postcss-loader',
							options: {
								plugins: [ require( 'autoprefixer' ) ],
							},
						},
						{
							loader: 'sass-loader',
							options: {
								includePaths: [ path.join( __dirname, 'client' ) ],
								data: `@import '${ path.join(
									__dirname,
									'assets/stylesheets/shared/_utils.scss'
								) }';`,
							},
						},
					],
				},
				{
					include: path.join( __dirname, 'client/sections.js' ),
					loader: path.join( __dirname, 'server', 'bundler', 'sections-loader' ),
				},
				{
					test: /\.html$/,
					loader: 'html-loader',
				},
				{
					test: /\.(?:gif|jpg|jpeg|png|svg)$/i,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: '[name]-[hash].[ext]',
								outputPath: 'images/',
							},
						},
					],
				},
				{
					include: require.resolve( 'tinymce/tinymce' ),
					use: 'exports-loader?window=tinymce',
				},
				{
					test: /node_modules[\/\\]tinymce/,
					use: 'imports-loader?this=>window',
				},
			],
		},
		resolve: {
			extensions: [ '.json', '.js', '.jsx' ],
			modules: [ path.join( __dirname, 'client' ), 'node_modules' ],
			alias: Object.assign(
				{
					'gridicons/example': 'gridicons/dist/example',
					'react-virtualized': 'react-virtualized/dist/commonjs',
					'social-logos/example': 'social-logos/build/example',
					debug: path.resolve( __dirname, 'node_modules/debug' ),
					store: 'store/dist/store.modern',
					gridicons$: path.resolve( __dirname, 'client/components/async-gridicons' ),
				},
				getAliasesForExtensions()
			),
		},
		node: false,
		plugins: _.compact( [
			! codeSplit && new webpack.optimize.LimitChunkCountPlugin( { maxChunks: 1 } ),
			new webpack.DefinePlugin( {
				'process.env.NODE_ENV': JSON.stringify( bundleEnv ),
				PROJECT_NAME: JSON.stringify( config( 'project' ) ),
				global: 'window',
			} ),
			new webpack.NormalModuleReplacementPlugin( /^path$/, 'path-browserify' ),
			new webpack.IgnorePlugin( /^props$/ ),
			isCalypsoClient && new webpack.IgnorePlugin( /^\.\/locale$/, /moment$/ ),
			new MiniCssExtractPluginWithRTL( {
				filename: cssFilename,
				rtlEnabled: true,
			} ),
			new WebpackRTLPlugin( {
				minify: isDevelopment ? false : cssnanoOptions,
			} ),
			new AssetsWriter( {
				filename: 'assets.json',
				path: path.join( __dirname, 'server', 'bundler' ),
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
					},
				} ),
			shouldEmitStats && new webpack.ProgressPlugin( createProgressHandler() ),
		] ),
		externals: _.compact( [
			externalizeWordPressPackages && wordpressExternals,
			externalizeWordPressPackages && 'wp',
			'electron',
		] ),
	};

	if ( calypsoEnv === 'desktop' ) {
		// no chunks or dll here, just one big file for the desktop app
		webpackConfig.output.filename = '[name].js';
		webpackConfig.output.chunkFilename = '[name].js';
	}

	if ( isDevelopment ) {
		// we should not use chunkhash in development: https://github.com/webpack/webpack-dev-server/issues/377#issuecomment-241258405
		// also we don't minify so dont name them .min.js
		webpackConfig.output.filename = '[name].js';
		webpackConfig.output.chunkFilename = '[name].js';

		webpackConfig.plugins.push( new webpack.HotModuleReplacementPlugin() );
		webpackConfig.entry.build.unshift( 'webpack-hot-middleware/client' );
	}

	if ( ! config.isEnabled( 'desktop' ) ) {
		webpackConfig.plugins.push(
			new webpack.NormalModuleReplacementPlugin( /^lib[\/\\]desktop$/, 'lodash/noop' )
		);
	}

	return webpackConfig;
}

module.exports = getWebpackConfig;
