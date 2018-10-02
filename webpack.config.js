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
const StatsWriter = require( './server/bundler/stats-writer' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const CircularDependencyPlugin = require( 'circular-dependency-plugin' );
const os = require( 'os' );

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
const shouldEmitStats = process.env.EMIT_STATS === 'true';
const shouldCheckForCycles = process.env.CHECK_CYCLES === 'true';
const codeSplit = config.isEnabled( 'code-splitting' );

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

const babelLoader = {
	loader: 'babel-loader',
	options: {
		configFile: path.resolve( __dirname, 'babel.config.js' ),
		babelrc: false,
		cacheDirectory: path.join( __dirname, 'build', '.babel-client-cache' ),
		cacheIdentifier,
	},
};

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
		profile: shouldEmitStats,
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
					cache: 'docker' !== process.env.CONTAINER,
					parallel: true,
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
								workers: Math.max( 2, Math.floor( os.cpus().length / 2 ) ),
							},
						},
						babelLoader,
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
					test: /extensions[\/\\]index/,
					exclude: path.join( __dirname, 'node_modules' ),
					loader: path.join( __dirname, 'server', 'bundler', 'extensions-loader' ),
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
					test: /\.(svg)$/,
					use: [
						{
							loader: 'file-loader',
							options: { name: '[name].[ext]', outputPath: 'images/' },
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
			shouldCheckForCycles &&
				new CircularDependencyPlugin( {
					exclude: /node_modules/,
					failOnError: false,
					allowAsyncCycles: false,
					cwd: process.cwd(),
				} ),
			shouldEmitStats &&
				new StatsWriter( {
					filename: 'stats.json',
					path: __dirname,
					stats: {
						assets: true,
						children: true,
						modules: true,
						source: false,
						reasons: true,
						issuer: false,
						timings: true,
					},
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
	} else {
		// jquery is only needed in the build for the desktop app
		// see electron bug: https://github.com/atom/electron/issues/254
		webpackConfig.externals.push( 'jquery' );
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
