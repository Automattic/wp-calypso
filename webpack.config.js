/***** WARNING: No ES6 modules here. Not transpiled! *****/

/**
 * External dependencies
 */
const _ = require( 'lodash' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const DashboardPlugin = require( 'webpack-dashboard/plugin' );
const findRoot = require( 'find-root' );
const fs = require( 'fs' );
const HappyPack = require( 'happypack' );
const HardSourceWebpackPlugin = require( 'hard-source-webpack-plugin' );
const path = require( 'path' );
const pathIsInside = require( 'path-is-inside' );
const webpack = require( 'webpack' );
const NameAllModulesPlugin = require( 'name-all-modules-plugin' );
const AssetsPlugin = require( 'assets-webpack-plugin' );

/**
 * Internal dependencies
 */
const cacheIdentifier = require( './server/bundler/babel/babel-loader-cache-identifier' );
const config = require( './server/config' );
const UseMinifiedFiles = require( './server/bundler/webpack-plugins/use-minified-files' );

/**
 * Internal variables
 */
const PROPKEY_ESNEXT = 'esnext';
const calypsoEnv = config( 'env_id' );
const bundleEnv = config( 'env' );
const nodeModulesDir = path.resolve( __dirname, 'node_modules' );

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

/*
 * Find package.json for file at `filepath`.
 * Return `true` if it has a property whose key is `PROPKEY_ESNEXT` or 'module'.
 * Taken from http://2ality.com/2017/06/pkg-esnext.html
 */
function hasPkgEsnext( filepath ) {
	const pkgRoot = findRoot( filepath );
	const packageJsonPath = path.resolve( pkgRoot, 'package.json' );
	const packageJsonText = fs.readFileSync( packageJsonPath,
		{ encoding: 'utf-8' } );
	const packageJson = JSON.parse( packageJsonText );
	return packageJson.hasOwnProperty( PROPKEY_ESNEXT ) || packageJson.hasOwnProperty( 'module' );
}

const babelLoader = {
	loader: 'babel-loader',
	options: {
		cacheDirectory: path.join( __dirname, 'build', '.babel-client-cache' ),
		cacheIdentifier: cacheIdentifier,
		plugins: [ [
			path.join( __dirname, 'server', 'bundler', 'babel', 'babel-plugin-transform-wpcalypso-async' ),
			{ async: config.isEnabled( 'code-splitting' ) }
		] ]
	}
};

const webpackConfig = {
	bail: calypsoEnv !== 'development',
	entry: {},
	devtool: 'false',
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
				test: /\.jsx?$/,
				// Should Babel transpile the file at `filepath`?
				include: ( filepath ) => ( ! pathIsInside( filepath, nodeModulesDir ) || hasPkgEsnext( filepath ) ),
				loader: [ 'happypack/loader' ]
			},
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
				use: 'exports-loader?window=tinymce',
			},
			{
				test: /node_modules[\/\\]tinymce/,
				use: 'imports-loader?this=>window',
			}
		]
	},
	resolve: {
		extensions: [ '.json', '.js', '.jsx' ],
		mainFields: [ PROPKEY_ESNEXT, 'browser', 'module', 'main' ],
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
	plugins: _.compact( [
		new webpack.DefinePlugin( {
			'process.env.NODE_ENV': JSON.stringify( bundleEnv ),
			'PROJECT_NAME': JSON.stringify( config( 'project' ) )
		} ),
		new webpack.IgnorePlugin( /^props$/ ),
		new CopyWebpackPlugin( [ { from: 'node_modules/flag-icon-css/flags/4x3', to: 'images/flags' } ] ),
		new HappyPack( {
			loaders: _.compact( [
				calypsoEnv === 'development' && config.isEnabled( 'webpack/hot-loader' ) && 'react-hot-loader',
				babelLoader
			] )
		} ),
		new webpack.NamedModulesPlugin(),
		new webpack.NamedChunksPlugin( chunk => {
			if ( chunk.name ) {
				return chunk.name;
			}
			return chunk.modules.map( m => path.relative( m.context, m.request ) ).join( '_' );
		} ),
		new NameAllModulesPlugin(),
		new AssetsPlugin( {
			filename: 'assets.json',
			path: path.join( __dirname, 'server', 'bundler' )
		} ),

	] ),
	externals: [ 'electron' ]
};

if ( calypsoEnv === 'desktop' ) {
	// no chunks or dll here, just one big file for the desktop app
	webpackConfig.output.filename = '[name].js';
} else {
	// vendor chunk
	webpackConfig.entry.vendor = [
		'classnames',
		'create-react-class',
		'gridicons',
		'i18n-calypso',
		'lodash',
		'moment',
		'page',
		'prop-types',
		'react',
		'react-dom',
		'react-redux',
		'redux',
		'redux-thunk',
		'social-logos',
		'store',
		'wpcom',
	];

	// for details on what the manifest is, see: https://webpack.js.org/guides/caching/
	// tldr: webpack maintains a mapping from chunk ids --> filenames.  whenever a filename changes
	// then the mapping changes.  By providing a non-existing chunkname to CommonsChunkPlugin,
	// it extracts the "runtime" so that the frequently changing mapping doesn't break caching of the entry chunks
	// NOTE: order matters. vendor must be before manifest.
	webpackConfig.plugins = webpackConfig.plugins.concat( [
		new webpack.optimize.CommonsChunkPlugin( { name: 'vendor', minChunks: Infinity } ),
		new webpack.optimize.CommonsChunkPlugin( { name: 'manifest' } )
	] );

	// jquery is only needed in the build for the desktop app
	// see electron bug: https://github.com/atom/electron/issues/254
	webpackConfig.externals.push( 'jquery' );
}

if ( calypsoEnv === 'development' ) {
	// we should not use chunkhash in development: https://github.com/webpack/webpack-dev-server/issues/377#issuecomment-241258405
	webpackConfig.output.filename = '[name].js';
	webpackConfig.output.chunkFilename = '[name].js';

	webpackConfig.plugins = webpackConfig.plugins.concat( [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.LoaderOptionsPlugin( { debug: true } ),
	] );
	webpackConfig.entry.build = [
		'webpack-hot-middleware/client',
		path.join( __dirname, 'client', 'boot', 'app' )
	];
	webpackConfig.devServer = { hot: true, inline: true };
	webpackConfig.devtool = '#eval';
} else {
	webpackConfig.plugins.push( new UseMinifiedFiles() );
	webpackConfig.entry.build = path.join( __dirname, 'client', 'boot', 'app' );
	webpackConfig.devtool = false;
}

if ( ! config.isEnabled( 'desktop' ) ) {
	webpackConfig.plugins.push( new webpack.NormalModuleReplacementPlugin( /^lib[\/\\]desktop$/, 'lodash/noop' ) );
}

if ( config.isEnabled( 'webpack/persistent-caching' ) ) {
	webpackConfig.recordsPath = path.join( __dirname, '.webpack-cache', 'client-records.json' );
	webpackConfig.plugins.unshift( new HardSourceWebpackPlugin( { cacheDirectory: path.join( __dirname, '.webpack-cache', 'client' ) } ) );
}

if ( process.env.DASHBOARD ) {
	 // dashboard wants to be first
	webpackConfig.plugins.unshift( new DashboardPlugin() );
}

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
