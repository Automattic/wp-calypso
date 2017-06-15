/***** WARNING: No ES6 modules here. Not transpiled! *****/

/**
 * External dependencies
 */
const webpack = require( 'webpack' );
const path = require( 'path' );
const fs = require( 'fs' );

/**
 * Internal dependencies
 */
const config = require( './server/config' );
const cacheIdentifier = require( './server/bundler/babel/babel-loader-cache-identifier' );
const ChunkFileNamePlugin = require( './server/bundler/plugin' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const HardSourceWebpackPlugin = require( 'hard-source-webpack-plugin' );
const DashboardPlugin = require( 'webpack-dashboard/plugin' );
const NamedModulesPlugin = require( './server/bundler/webpack-plugins/NamedModulesPlugin' );
const WebpackChunkHash = require( 'webpack-chunk-hash' );

/**
 * Internal variables
 */
const calypsoEnv = config( 'env_id' );

const bundleEnv = config( 'env' );

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
 */
function getAliasesForExtensions() {
	const extensionsDirectory = path.join( __dirname, 'client', 'extensions' );
	const extensionsNames = fs
		.readdirSync( extensionsDirectory )
		.filter( filename => filename.indexOf( '.' ) === -1 ); // heuristic for finding directories

	const aliasesMap = {};
	extensionsNames.forEach( extensionName =>
		aliasesMap[ extensionName ] = path.join( extensionsDirectory, extensionName )
	);
	return aliasesMap;
}

const webpackConfig = {
	bail: calypsoEnv !== 'development',
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
		rules: [
			{
				test: /extensions[\/\\]index/,
				exclude: path.join( __dirname, 'node_modules' ),
				loader: path.join( __dirname, 'server', 'bundler', 'extensions-loader' )
			},
			{
				test: /sections.js$/,
				exclude: path.join( __dirname, 'node_modules' ),
				loader: path.join( __dirname, 'server', 'bundler', 'loader' )
			},
			{
				test: /\.html$/,
				loader: 'html-loader'
			},
			{
				include: require.resolve( 'tinymce/tinymce' ),
				loader: 'exports-loader',
				query: {
					window: 'tinymce'
				}
			},
			{
				test: /node_modules[\/\\]tinymce/,
				use: 'imports-loader?this=>window',
			}
		]
	},
	resolve: {
		extensions: [ '.json', '.js', '.jsx' ],
		modules: [
			path.join( __dirname, 'client' ),
			'node_modules',
		],
		alias: Object.assign(
			{
				'react-virtualized': 'react-virtualized/dist/commonjs',
				'social-logos/example': 'social-logos/build/example'
			},
			getAliasesForExtensions()
		),
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
		new DashboardPlugin(),
		new webpack.DefinePlugin( {
			'process.env': {
				NODE_ENV: JSON.stringify( bundleEnv )
			},
			'PROJECT_NAME': JSON.stringify( config( 'project' ) )
		} ),
		new webpack.IgnorePlugin( /^props$/ ),
		new CopyWebpackPlugin( [ { from: 'node_modules/flag-icon-css/flags/4x3', to: 'images/flags' } ] ),
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
		new webpack.optimize.CommonsChunkPlugin( {
			name: 'vendor',
			filename: 'vendor.[chunkhash].js',
		} )
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

const jsRules = {
	test: /\.jsx?$/,
	exclude: /node_modules[\/\\](?!notifications-panel)/,
	loader: [ {
		loader: 'babel-loader',
		options: {
			cacheDirectory: path.join( __dirname, 'build', '.babel-client-cache' ),
			cacheIdentifier: cacheIdentifier,
			plugins: [ [
				path.join( __dirname, 'server', 'bundler', 'babel', 'babel-plugin-transform-wpcalypso-async' ),
				{ async: config.isEnabled( 'code-splitting' ) }
			] ]
		}
	} ]
};

if ( calypsoEnv === 'development' ) {
	webpackConfig.plugins = webpackConfig.plugins.concat( [
		new NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.LoaderOptionsPlugin( { debug: true } ),
	] );
	webpackConfig.entry.build = [
		'webpack-hot-middleware/client',
		path.join( __dirname, 'client', 'boot', 'app' )
	];
	jsRules.loader = [ 'react-hot-loader', ...jsRules.loader ];
	webpackConfig.devServer = { hot: true, inline: true };


	if ( config.isEnabled( 'use-source-maps' ) ) {
		webpackConfig.devtool = '#eval-cheap-module-source-map';
		webpackConfig.module.rules.push( {
			test: /\.jsx?$/,
			enforce: 'pre',
			loader: 'source-map-loader'
		} );
	}
} else {
	webpackConfig.entry.build = path.join( __dirname, 'client', 'boot', 'app' );
	webpackConfig.plugins = webpackConfig.plugins.concat( [
		new webpack.HashedModuleIdsPlugin(),
		new WebpackChunkHash(),
	] );
	webpackConfig.devtool = false;
}

if ( calypsoEnv === 'production' ) {
	webpackConfig.plugins.push( new webpack.NormalModuleReplacementPlugin(
		/^debug$/,
		path.join( __dirname, 'client', 'lib', 'debug-noop' )
	) );
}

if ( ! config.isEnabled( 'desktop' ) ) {
	webpackConfig.plugins.push( new webpack.NormalModuleReplacementPlugin( /^lib[\/\\]desktop$/, 'lodash/noop' ) );
}

if ( config.isEnabled( 'webpack/persistent-caching' ) ) {
	webpackConfig.recordsPath = path.join( __dirname, '.webpack-cache', 'client-records.json' );
	webpackConfig.plugins.unshift( new HardSourceWebpackPlugin( { cacheDirectory: path.join( __dirname, '.webpack-cache', 'client' ) } ) );
}

webpackConfig.module.rules = [ jsRules ].concat( webpackConfig.module.rules );

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
