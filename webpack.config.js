/** @format */
/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const _ = require( 'lodash' );
const { execSync } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const AssetsWriter = require( './server/bundler/assets-writer' );
const MiniCssExtractPluginWithRTL = require( 'mini-css-extract-plugin-with-rtl' );
const WebpackRTLPlugin = require( 'webpack-rtl-plugin' );
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const CircularDependencyPlugin = require( 'circular-dependency-plugin' );
const DuplicatePackageCheckerPlugin = require( 'duplicate-package-checker-webpack-plugin' );
const MomentTimezoneDataPlugin = require( 'moment-timezone-data-webpack-plugin' );
const browserslist = require( 'browserslist' );
const caniuse = require( 'caniuse-api' );

/**
 * Internal dependencies
 */
const cacheIdentifier = require( './server/bundler/babel/babel-loader-cache-identifier' );
const config = require( './server/config' );
const { workerCount } = require( './webpack.common' );

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

const browserslistEnvironment = 'defaults';
const browsers = browserslist( null, { env: browserslistEnvironment } );
process.env.BROWSERSLIST_ENV = browserslistEnvironment;

/**
 * Plugin that generates the `public/custom-properties.css` file before compilation
 */
class BuildCustomPropertiesCssPlugin {
	apply( compiler ) {
		compiler.hooks.compile.tap( 'BuildCustomPropertiesCssPlugin', () =>
			execSync( 'node ' + path.join( __dirname, 'bin', 'build-custom-properties-css.js' ), {
				cwd: __dirname,
			} )
		);
	}
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
 * Auxiliary method to help in picking an ECMAScript version based on a list
 * of supported browser versions.
 * Used in configuring Terser.
 *
 * @param {Array<String>} supportedBrowsers The list of supported browsers.
 *
 * @returns {Number} The maximum supported ECMAScript version.
 */
function chooseTerserEcmaVersion( supportedBrowsers ) {
	if ( ! caniuse.isSupported( 'arrow-functions', supportedBrowsers ) ) {
		return 5;
	}
	if ( ! caniuse.isSupported( 'es6-class', supportedBrowsers ) ) {
		return 5;
	}

	return 6;
}

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
function getWebpackConfig( {
	cssFilename,
	externalizeWordPressPackages = false,
	preserveCssCustomProperties = true,
} = {} ) {
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
					parallel: workerCount,
					sourceMap: Boolean( process.env.SOURCEMAP ),
					terserOptions: {
						ecma: chooseTerserEcmaVersion( browsers ),
						ie8: false,
						safari10: browsers.some(
							browser => browser.includes( 'safari 10' ) || browser.includes( 'ios_saf 10' )
						),
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
								workers: workerCount,
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
						{
							loader: 'css-loader',
							options: {
								importLoaders: 2,
							},
						},
						{
							loader: 'postcss-loader',
							options: {
								config: {
									ctx: {
										preserveCssCustomProperties,
									},
								},
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
				minify: ! isDevelopment,
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
						chunkGroups: true,
					},
				} ),
			shouldEmitStats && new webpack.ProgressPlugin( createProgressHandler() ),
			new BuildCustomPropertiesCssPlugin(),
			new MomentTimezoneDataPlugin( {
				startYear: 2000,
			} ),
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
