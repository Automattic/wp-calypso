/***** WARNING: ES5 code only here. Not transpiled! *****/

/**
 * External dependencies
 */
var webpack = require( 'webpack' ),
	HappyPack = require( 'happypack' ),
	CPU_COUNT = require( 'os' ).cpus().length,
	path = require( 'path' );

/**
 * Internal dependencies
 */
var config = require( './server/config' ),
	ChunkFileNamePlugin = require( './server/bundler/plugin' ),
	PragmaCheckPlugin = require( 'server/pragma-checker' ),
	TimingPlugin = require( 'server/timing-plugin' );

/**
 * Internal variables
 */
var CALYPSO_ENV = process.env.CALYPSO_ENV || 'development',
	jsLoader,
	webpackConfig;

require( 'server/bundler/remove-parent-modules-monkeypatch' );

webpackConfig = {
	cache: true,
	entry: {},
	output: {
		path: path.join( __dirname, 'public' ),
		publicPath: '/calypso/',
		filename: '[name].[hash].js',
		chunkFilename: '[name].[chunkhash].js',
		devtoolModuleFilenameTemplate: 'app:///[resource-path]'
	},
	devtool: '#eval',
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
		root: path.join( __dirname, 'client' ),
		modulesDirectories: [ 'node_modules' ]
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
		new HappyPack( {
			id: 'babel',
			threads: 1,
			loaders: [
				{
					path: path.resolve( __dirname, 'node_modules/babel-loader/index.js' ),
					query: '?optional[]=runtime'
				}
			]
		} ),
		new webpack.optimize.OccurenceOrderPlugin( true ),
		new webpack.IgnorePlugin( /^props$/ ),
		new webpack.IgnorePlugin( /^\.\/locale$/, /moment$/ )
	],
	externals: [ 'electron' ]
};

if ( CALYPSO_ENV === 'desktop' || CALYPSO_ENV === 'desktop-mac-app-store' ) {
	webpackConfig.output.filename = '[name].js';
} else {
	webpackConfig.entry.vendor = [ 'react', 'store', 'page', 'wpcom-unpublished', 'jed', 'debug' ];
	// webpackConfig.plugins.push( new webpack.optimize.CommonsChunkPlugin( {
	// 	name: [ 'vendor', 'build-' + CALYPSO_ENV ],
	// /	minChunks: 3
	//  } ) );

	webpackConfig.plugins.push( new ChunkFileNamePlugin() );
	//webpackConfig.plugins.push( new TimingPlugin() );
	// jquery is only needed in the build for the desktop app
	// see electron bug: https://github.com/atom/electron/issues/254
	webpackConfig.externals.push( 'jquery' );
}

 jsLoader = {
 	test: /\.jsx?$/,
 	exclude: /node_modules/,
 	loaders: [ 'happypack/loader?id=babel' ]
 };

// jsLoader = {
// 	test: /\.jsx?$/,
// 	exclude: /node_modules/,
// 	loaders: [ 'babel-loader?optional[]=runtime' ]
// };

if ( CALYPSO_ENV === 'development' ) {
	webpackConfig.plugins.push( new PragmaCheckPlugin() );
	webpackConfig.plugins.push( new webpack.HotModuleReplacementPlugin() );
	webpackConfig.entry[ 'build-' + CALYPSO_ENV ] = [
		'webpack-dev-server/client?/',
		'webpack/hot/only-dev-server',
		path.join( __dirname, 'client', 'boot' )
	];

	// Add react hot loader before babel-loader
	jsLoader.loaders = [ 'react-hot' ].concat( jsLoader.loaders );
} else {
	webpackConfig.entry[ 'build-' + CALYPSO_ENV ] = path.join( __dirname, 'client', 'boot' );
	webpackConfig.devtool = false;
}

webpackConfig.module.loaders = webpackConfig.module.loaders.concat( [ jsLoader ] );

module.exports = webpackConfig;
