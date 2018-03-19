/** @format */
/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const _ = require( 'lodash' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const fs = require( 'fs' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const AssetsWriter = require( './server/bundler/assets-writer' );
const StatsWriter = require( './server/bundler/stats-writer' );
const prism = require( 'prismjs' );
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );

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
const shouldMinify = process.env.MINIFY_JS === 'true' || bundleEnv === 'production';
const shouldEmitStats = process.env.EMIT_STATS === 'true';

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
		cacheDirectory: path.join( __dirname, 'build', '.babel-client-cache' ),
		cacheIdentifier,
	},
};

const webpackConfig = {
	bail: ! isDevelopment,
	entry: { build: [ path.join( __dirname, 'client', 'boot', 'app' ) ] },
	profile: shouldEmitStats,
	mode: isDevelopment ? 'development' : 'production',
	devtool: isDevelopment ? '#eval' : process.env.SOURCEMAP || false, // in production builds you can specify a source-map via env var
	output: {
		path: path.join( __dirname, 'public' ),
		publicPath: '/calypso/',
		filename: '[name].[chunkhash].opt.js', // prefer the chunkhash, which depends on the chunk, not the entire build
		chunkFilename: '[name].[chunkhash].opt.js', // ditto
		devtoolModuleFilenameTemplate: 'app:///[resource-path]',
	},
	optimization: {
		splitChunks: {
			chunks: 'all',
			name: isDevelopment || shouldEmitStats,
			maxAsyncRequests: 20,
			maxInitialRequests: 5,
		},
		runtimeChunk: { name: 'manifest' },
		namedModules: true,
		namedChunks: isDevelopment,
		minimize: shouldMinify,
		minimizer: [
			new UglifyJsPlugin( {
				cache: 'docker' !== process.env.CONTAINER,
				parallel: true,
				sourceMap: Boolean( process.env.SOURCEMAP ),
				uglifyOptions: {
					compress: {
						/**
						 * Produces inconsistent results
						 * Enable when the following is resolved:
						 * https://github.com/mishoo/UglifyJS2/issues/3010
						 */
						collapse_vars: false,
					},
					ecma: 5,
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
				exclude: /node_modules[\/\\](?!notifications-panel)/,
				use: _.compact( [
					{
						loader: 'thread-loader',
						options: { workers: 3 },
					},
					babelLoader,
				] ),
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
				include: require.resolve( 'tinymce/tinymce' ),
				use: 'exports-loader?window=tinymce',
			},
			{
				test: /node_modules[\/\\]tinymce/,
				use: 'imports-loader?this=>window',
			},
			{
				test: /README\.md$/,
				use: [
					{ loader: 'html-loader' },
					{
						loader: 'markdown-loader',
						options: {
							sanitize: true,
							highlight: function( code, language ) {
								const syntax = prism.languages[ language ];
								return syntax ? prism.highlight( code, syntax ) : code;
							},
						},
					},
				],
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
			},
			getAliasesForExtensions()
		),
	},
	node: false,
	plugins: _.compact( [
		new webpack.DefinePlugin( {
			'process.env.NODE_ENV': JSON.stringify( bundleEnv ),
			PROJECT_NAME: JSON.stringify( config( 'project' ) ),
			global: 'window',
		} ),
		new webpack.NormalModuleReplacementPlugin( /^path$/, 'path-browserify' ),
		new webpack.IgnorePlugin( /^props$/ ),
		new CopyWebpackPlugin( [
			{ from: 'node_modules/flag-icon-css/flags/4x3', to: 'images/flags' },
		] ),
		new AssetsWriter( {
			filename: 'assets.json',
			path: path.join( __dirname, 'server', 'bundler' ),
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
					reasons: false,
					issuer: false,
					timings: true,
				},
			} ),
	] ),
	externals: [ 'electron' ],
};

if ( calypsoEnv === 'desktop' ) {
	// no chunks or dll here, just one big file for the desktop app
	webpackConfig.output.filename = '[name].js';
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

if ( shouldMinify ) {
	webpackConfig.plugins.push(
		new UglifyJsPlugin( {
			cache: 'docker' !== process.env.CONTAINER,
			parallel: true,
			sourceMap: Boolean( process.env.SOURCEMAP ),
			uglifyOptions: {
				compress: {
					/**
					 * Produces inconsistent results
					 * Enable when the following is resolved:
					 * https://github.com/mishoo/UglifyJS2/issues/3010
					 */
					collapse_vars: false,
				},
				ecma: 5,
			},
		} )
	);
}

module.exports = webpackConfig;
