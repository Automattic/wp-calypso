/***** WARNING: No ES6 modules here. Not transpiled! *****/

/**
 * External dependencies
 */
const webpack = require( 'webpack' ),
	path = require( 'path' );

/**
 * Internal dependencies
 */
const config = require( './server/config' ),
	cacheIdentifier = require( './server/bundler/babel/babel-loader-cache-identifier' ),
	ChunkFileNamePlugin = require( './server/bundler/plugin' ),
	CopyWebpackPlugin = require( 'copy-webpack-plugin' ),
	HardSourceWebpackPlugin = require( 'hard-source-webpack-plugin' ),
	WebpackStableBuildPlugin = require( './server/bundler/webpack/stable-build-plugin' );

/**
 * Internal variables
 */
const calypsoEnv = config( 'env_id' );

const bundleEnv = config( 'env' );

const webpackConfig = {
	bail: calypsoEnv !== 'development',
	cache: true,
	entry: {},
	devtool: '#eval',
	output: {
		path: path.join( __dirname, 'public' ),
		publicPath: '/calypso/',
		filename: '[name].[chunkhash].js', // prefer the chunkhash, which depends on the chunk, not the entire build
		chunkFilename: '[name].[chunkhash].js', // ditto
		devtoolModuleFilenameTemplate: 'app:///[resource-path]'
	},
	module: {
		// avoids this warning:
		// https://github.com/localForage/localForage/issues/577
		noParse: /[\/\\]node_modules[\/\\]localforage[\/\\]dist[\/\\]localforage\.js$/,
		loaders: [
			{
				test: /extensions\/index/,
				exclude: 'node_modules',
				loader: path.join( __dirname, 'server', 'bundler', 'extensions-loader' )
			},
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
		root: [ path.join( __dirname, 'client' ), path.join( __dirname, 'client', 'extensions' ) ],
		modulesDirectories: [ 'node_modules' ],
		alias: {
			'react-virtualized': 'react-virtualized/dist/commonjs',
			'social-logos/example': 'social-logos/build/example'
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
				NODE_ENV: JSON.stringify( bundleEnv )
			},
			'PROJECT_NAME': JSON.stringify( config( 'project' ) )
		} ),
		new WebpackStableBuildPlugin( {
			seed: 0
		} ),
		new webpack.IgnorePlugin( /^props$/ ),
		new CopyWebpackPlugin( [ { from: 'node_modules/flag-icon-css/flags/4x3', to: 'images/flags' } ] )
	],
	externals: [ 'electron' ]
};

if ( calypsoEnv === 'desktop' ) {
	// no chunks or dll here, just one big file for the desktop app
	webpackConfig.output.filename = '[name].js';
} else {
	// vendor chunk
	webpackConfig.entry.vendor = [
		'classnames',
		'i18n-calypso',
		'moment',
		'page',
		'react',
		'react-dom',
		'react-redux',
		'redux',
		'redux-thunk',
		'store',
		'wpcom',
	];

	webpackConfig.plugins.push(
		new webpack.optimize.CommonsChunkPlugin(
			'vendor',
			'vendor.[chunkhash].js'
		)
	);

	// slight black magic here. 'manifest' is a secret webpack module that includes the webpack loader and
	// the mapping from module id to path.
	//
	// We extract it to prevent build-$env chunk from changing when the contents of a child chunk change.
	//
	// See https://github.com/webpack/webpack/issues/1315 for some backgroud. Guidance here taken from
	// https://github.com/webpack/webpack/issues/1315#issuecomment-158530525.
	//
	// Our hashes will still change when modules are added or removed, but many of our deploys don't
	// involve module structure changes, so this should at least help in many cases.
	webpackConfig.plugins.push(
		new webpack.optimize.CommonsChunkPlugin( {
			name: 'manifest',
			// have to use [hash] here instead of [chunkhash] because this is an entry chunk
			filename: 'manifest.[hash].js'
		} )
	);

	// Somewhat badly named, this is our custom chunk loader that knows about sections
	// and our loading notification infrastructure
	webpackConfig.plugins.push( new ChunkFileNamePlugin() );

	// jquery is only needed in the build for the desktop app
	// see electron bug: https://github.com/atom/electron/issues/254
	webpackConfig.externals.push( 'jquery' );
}

const jsLoader = {
	test: /\.jsx?$/,
	exclude: /node_modules/,
	loader: 'babel',
	query: {
		cacheDirectory: './.babel-cache',
		cacheIdentifier: cacheIdentifier,
		plugins: [ [
			path.join( __dirname, 'server', 'bundler', 'babel', 'babel-plugin-transform-wpcalypso-async' ),
			{ async: config.isEnabled( 'code-splitting' ) }
		] ]
	}
};

if ( calypsoEnv === 'development' ) {
	const DashboardPlugin = require( 'webpack-dashboard/plugin' );
	webpackConfig.plugins.splice( 0, 0, new DashboardPlugin() );
	webpackConfig.plugins.push( new webpack.HotModuleReplacementPlugin() );
	webpackConfig.entry.build = [
		'webpack-dev-server/client?/',
		'webpack/hot/only-dev-server',
		path.join( __dirname, 'client', 'boot', 'app' )
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
	webpackConfig.entry.build = path.join( __dirname, 'client', 'boot', 'app' );
	webpackConfig.debug = false;
	webpackConfig.devtool = false;
}

if ( calypsoEnv === 'production' ) {
	webpackConfig.plugins.push( new webpack.NormalModuleReplacementPlugin(
		/^debug$/,
		path.join( __dirname, 'client', 'lib', 'debug-noop' )
	) );
}

if ( ! config.isEnabled( 'desktop' ) ) {
	webpackConfig.plugins.push( new webpack.NormalModuleReplacementPlugin( /^lib\/desktop$/, 'lodash/noop' ) );
}

if ( config.isEnabled( 'webpack/persistent-caching' ) ) {
	webpackConfig.recordsPath = path.join( __dirname, '.webpack-cache', 'client-records.json' );
	webpackConfig.plugins.unshift( new HardSourceWebpackPlugin( { cacheDirectory: path.join( __dirname, '.webpack-cache', 'client' ) } ) );
}

webpackConfig.module.loaders = [ jsLoader ].concat( webpackConfig.module.loaders );

if ( process.env.WEBPACK_OUTPUT_JSON ) {
	webpackConfig.devtool = 'cheap-module-source-map';
	webpackConfig.plugins.push( new webpack.optimize.UglifyJsPlugin( {
		minimize: true,
		compress: {
			warnings: false,
			conditionals: true,
			unused: true,
			comparisons: true,
			sequences: true,
			dead_code: true,
			evaluate: true,
			if_return: true,
			join_vars: true,
			negate_iife: false,
			screw_ie8: true
		},
		sourceMap: true
	} ) );
}

module.exports = webpackConfig;
