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
const CircularDependencyPlugin = require( 'circular-dependency-plugin' );
const threadLoader = require( 'thread-loader' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

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
		cacheDirectory: path.join( __dirname, 'build', '.babel-client-cache' ),
		cacheIdentifier,
	},
};

threadLoader.warmup( {}, [ 'babel-loader' ] );

// Main CSS loader for everything but blocks..
const cssExtractPlugin = new MiniCssExtractPlugin( {
	filename: path.resolve( __dirname, 'public/style-gutenberg.css' ),
} );

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
			chunks: codeSplit ? 'all' : 'async',
			name: isDevelopment || shouldEmitStats,
			maxAsyncRequests: 20,
			maxInitialRequests: 5,
		},
		runtimeChunk: codeSplit ? { name: 'manifest' } : false,
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
				use: [ 'thread-loader', babelLoader ],
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
			{
				test: /\.pegjs/,
				use: 'pegjs-loader',
			},
			{
				test: /\.s?css$/,
				use: [
					process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							plugins: [
								require( path.resolve( __dirname, 'vendor/gutenberg/packages/postcss-themes' ) )( {
									defaults: {
										primary: '#0085ba',
										secondary: '#11a0d2',
										toggle: '#11a0d2',
										button: '#0085ba',
										outlines: '#007cba',
									},
									themes: {
										'admin-color-light': {
											primary: '#0085ba',
											secondary: '#c75726',
											toggle: '#11a0d2',
											button: '#0085ba',
											outlines: '#007cba',
										},
										'admin-color-blue': {
											primary: '#82b4cb',
											secondary: '#d9ab59',
											toggle: '#82b4cb',
											button: '#d9ab59',
											outlines: '#417e9B',
										},
										'admin-color-coffee': {
											primary: '#c2a68c',
											secondary: '#9fa47b',
											toggle: '#c2a68c',
											button: '#c2a68c',
											outlines: '#59524c',
										},
										'admin-color-ectoplasm': {
											primary: '#a7b656',
											secondary: '#c77430',
											toggle: '#a7b656',
											button: '#a7b656',
											outlines: '#523f6d',
										},
										'admin-color-midnight': {
											primary: '#e14d43',
											secondary: '#77a6b9',
											toggle: '#77a6b9',
											button: '#e14d43',
											outlines: '#497b8d',
										},
										'admin-color-ocean': {
											primary: '#a3b9a2',
											secondary: '#a89d8a',
											toggle: '#a3b9a2',
											button: '#a3b9a2',
											outlines: '#5e7d5e',
										},
										'admin-color-sunrise': {
											primary: '#d1864a',
											secondary: '#c8b03c',
											toggle: '#c8b03c',
											button: '#d1864a',
											outlines: '#837425',
										},
									},
								} ),
								require( 'autoprefixer' ),
								require( 'postcss-color-function' ),
							],
						},
					},
					{
						loader: 'sass-loader',
						query: {
							includePaths: [ 'vendor/gutenberg/edit-post/assets/stylesheets' ],
							data:
								'@import "./_colors"; @import "breakpoints"; @import "variables"; @import "mixins"; @import "animations";@import "z-index";',
							outputStyle: 'production' === process.env.NODE_ENV ? 'compressed' : 'nested',
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
			{
				'@wordpress/core-blocks': path.resolve( __dirname, 'vendor/gutenberg/core-blocks' ),
				'@wordpress/blocks': path.resolve( __dirname, 'vendor/gutenberg/blocks' ),
				'@wordpress/components': path.resolve( __dirname, 'vendor/gutenberg/components' ),
				'@wordpress/editor': path.resolve( __dirname, 'vendor/gutenberg/editor' ),
				'@wordpress/viewport': path.resolve( __dirname, 'vendor/gutenberg/viewport' ),
				'@wordpress/utils': path.resolve( __dirname, 'vendor/gutenberg/utils' ),
				'@wordpress/nux': path.resolve( __dirname, 'vendor/gutenberg/nux' ),
				'@wordpress/api-request': path.resolve(
					__dirname,
					'vendor/gutenberg/packages/api-request'
				),
				'@wordpress/blob': path.resolve( __dirname, 'vendor/gutenberg/packages/blob' ),
				'@wordpress/core-data': path.resolve( __dirname, 'vendor/gutenberg/packages/core-data' ),
				'@wordpress/dom': path.resolve( __dirname, 'vendor/gutenberg/packages/dom' ),
				'@wordpress/data': path.resolve( __dirname, 'vendor/gutenberg/packages/data' ),
				'@wordpress/date': path.resolve( __dirname, 'vendor/gutenberg/packages/date' ),
				'@wordpress/deprecated': path.resolve( __dirname, 'vendor/gutenberg/packages/deprecated' ),
				'@wordpress/element': path.resolve( __dirname, 'vendor/gutenberg/packages/element' ),
				'@wordpress/keycodes': path.resolve( __dirname, 'vendor/gutenberg/packages/keycodes' ),
				'@wordpress/shortcode': path.resolve( __dirname, 'vendor/gutenberg/packages/shortcode' ),
				'@wordpress/usersettings': path.resolve(
					__dirname,
					'vendor/gutenberg/packages/usersettings'
				),
			},
			getAliasesForExtensions()
		),
	},
	node: false,
	plugins: _.compact( [
		cssExtractPlugin,
		! codeSplit && new webpack.optimize.LimitChunkCountPlugin( { maxChunks: 1 } ),
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
	webpackConfig.output.chunkFilename = '[name].js';
} else {
	// jquery is only needed in the build for the desktop app
	// see electron bug: https://github.com/atom/electron/issues/254
	// Needed by Gutenberg's api-request, too, so let Webpack bundle it instead of externalizing
	//webpackConfig.externals.push( 'jquery' );
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
