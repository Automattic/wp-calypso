/***** WARNING: ES5 code only here. Not transpiled! *****/

/**
 * External dependencies
 */
var webpack = require( 'webpack' ),
	path = require( 'path' ),
	config = require( 'config' );

/**
 * Internal dependencies
 */
var config = require( './server/config' ),
	sections = require( './client/sections' ),
	ChunkFileNamePlugin = require( './server/bundler/plugin' ),
	PragmaCheckPlugin = require( 'server/pragma-checker' );

/**
 * Internal variables
 */
var CALYPSO_ENV = process.env.CALYPSO_ENV || 'development',
	jsLoader,
	webpackConfig;

const sectionCount = sections.length;

webpackConfig = {
	bail: CALYPSO_ENV !== 'development',
	cache: true,
	entry: {},
	devtool: '#eval',
	output: {
		path: path.join( __dirname, 'public' ),
		publicPath: '/calypso/',
		filename: '[name].[hash].js',
		chunkFilename: '[name].[chunkhash].js',
		devtoolModuleFilenameTemplate: 'app:///[resource-path]'
	},
	module: {
		loaders: [
			{
				test: /sections.js$/,
				exclude: 'node_modules',
				loader: path.join( __dirname, 'server', 'bundler', 'loader' )
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			},
			{
				test: /\.html$/,
				loader: 'html-loader'
			},
			{
				include: require.resolve( 'tinymce/tinymce' ),
				loader: 'exports?window.tinymce',
			},
			{
				include: /node_modules\/tinymce/,
				loader: 'imports?this=>window',
			}
		]
	},
	resolve: {
		extensions: [ '', '.json', '.js', '.jsx' ],
		root: [ path.join( __dirname, 'client' ) ],
		modulesDirectories: [ 'node_modules' ],
		alias: {
			'react-virtualized': 'react-virtualized/dist/commonjs'
		}
	},
	resolveLoader: {
		root: [ __dirname ]
	},
	node: {
		console: false,
		process: true,
		global: true,
		Buffer: true,
		__filename: 'mock',
		__dirname: 'mock',
		fs: 'empty'
	},
	plugins: [
		new webpack.DefinePlugin( {
			'process.env': {
				NODE_ENV: JSON.stringify( config( 'env' ) )
			}
		} ),
		new webpack.optimize.OccurenceOrderPlugin( true ),
		new webpack.IgnorePlugin( /^props$/ )
	],
	externals: [ 'electron' ]
};

if ( CALYPSO_ENV === 'desktop' || CALYPSO_ENV === 'desktop-mac-app-store' ) {
	webpackConfig.output.filename = '[name].js';
} else {
	webpackConfig.entry.vendor = [ 'react', 'store', 'page', 'wpcom', 'jed', 'debug' ];
	webpackConfig.plugins.push( new webpack.optimize.CommonsChunkPlugin( 'vendor', '[name].[hash].js' ) );
	webpackConfig.plugins.push( new webpack.optimize.CommonsChunkPlugin( {
		children: true,
		minChunks: Math.floor( sectionCount * 0.25 ),
		async: true,
		filename: 'commons.[hash].js'
	} ) );
	webpackConfig.plugins.push( new ChunkFileNamePlugin() );
	// jquery is only needed in the build for the desktop app
	// see electron bug: https://github.com/atom/electron/issues/254
	webpackConfig.externals.push( 'jquery' );
}

jsLoader = {
	test: /\.jsx?$/,
	exclude: /node_modules/,
	loaders: [ 'babel-loader?cacheDirectory' ]
};

if ( CALYPSO_ENV === 'development' ) {
	webpackConfig.plugins.push( new PragmaCheckPlugin() );
	webpackConfig.plugins.push( new webpack.HotModuleReplacementPlugin() );
	webpackConfig.entry[ 'build-' + CALYPSO_ENV ] = [
		'webpack-dev-server/client?/',
		'webpack/hot/only-dev-server',
		path.join( __dirname, 'client', 'boot' )
	];

	if ( config.isEnabled( 'use-source-maps' ) ) {
		webpackConfig.debug = true;
		webpackConfig.devtool = '#eval-cheap-module-source-map';
		webpackConfig.module.preLoaders = webpackConfig.module.preLoaders || [];
		webpackConfig.module.preLoaders.push( {
			test: /\.jsx?$/,
			loader: 'source-map-loader'
		} );
	} else {
		// Add react hot loader before babel-loader.
		// It's loaded by default since `use-source-maps` is disabled by default.
		jsLoader.loaders = [ 'react-hot' ].concat( jsLoader.loaders );
	}
} else {
	webpackConfig.entry[ 'build-' + CALYPSO_ENV ] = path.join( __dirname, 'client', 'boot' );
	webpackConfig.debug = false;
	webpackConfig.devtool = false;
}

webpackConfig.module.loaders = [ jsLoader ].concat( webpackConfig.module.loaders );

module.exports = webpackConfig;
