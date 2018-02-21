/** @format */
/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */

/**
 * External dependencies
 */
const _ = require( 'lodash' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const fs = require( 'fs' );
const HappyPack = require( 'happypack' );
const HardSourceWebpackPlugin = require( 'hard-source-webpack-plugin' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const NameAllModulesPlugin = require( 'name-all-modules-plugin' );
const AssetsPlugin = require( 'assets-webpack-plugin' );
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );
const prism = require( 'prismjs' );

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
const isDevelopment = bundleEnv === 'development';
const shouldMinify = process.env.hasOwnProperty( 'MINIFY_JS' )
	? process.env.MINIFY_JS === 'true'
	: ! isDevelopment;

// load in the babel config from babelrc and disable commonjs transform
// this enables static analysis from webpack including treeshaking
// also disable add-module-exports. TODO: remove add-module-exports from babelrc. requires fixing tests
const babelConfig = JSON.parse( fs.readFileSync( './.babelrc', { encoding: 'utf8' } ) );
const babelPresetEnv = _.find( babelConfig.presets, preset => preset[ 0 ] === 'env' );
babelPresetEnv[ 1 ].modules = false;
_.remove( babelConfig.plugins, elem => elem === 'add-module-exports' );

// remove the babel-lodash-es plugin from env.test -- it's needed only for Jest tests.
// The Webpack-using NODE_ENV=test build doesn't need it, as there is a special loader for that.
_.remove( babelConfig.env.test.plugins, elem => /babel-lodash-es/.test( elem ) );

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
	extensionsNames.forEach(
		extensionName =>
			( aliasesMap[ extensionName ] = path.join( extensionsDirectory, extensionName ) )
	);
	return aliasesMap;
}

const babelLoader = {
	loader: 'babel-loader',
	options: Object.assign( {}, babelConfig, {
		babelrc: false,
		cacheDirectory: path.join( __dirname, 'build', '.babel-client-cache' ),
		cacheIdentifier: cacheIdentifier,
		plugins: [
			...babelConfig.plugins,
			[
				path.join(
					__dirname,
					'server',
					'bundler',
					'babel',
					'babel-plugin-transform-wpcalypso-async'
				),
				{ async: config.isEnabled( 'code-splitting' ) },
			],
			'inline-imports.js',
		],
	} ),
};

const webpackConfig = {
	bail: ! isDevelopment,
	entry: {},
	devtool: isDevelopment ? '#eval' : process.env.SOURCEMAP || false, // in production builds you can specify a source-map via env var
	output: {
		path: path.join( __dirname, 'public' ),
		publicPath: '/calypso/',
		filename: '[name].[chunkhash].min.js', // prefer the chunkhash, which depends on the chunk, not the entire build
		chunkFilename: '[name].[chunkhash].min.js', // ditto
		devtoolModuleFilenameTemplate: 'app:///[resource-path]',
	},
	module: {
		// avoids this warning:
		// https://github.com/localForage/localForage/issues/577
		noParse: /[\/\\]node_modules[\/\\]localforage[\/\\]dist[\/\\]localforage\.js$/,
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules[\/\\](?!notifications-panel)/,
				loader: [ 'happypack/loader' ],
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
				'react-virtualized': 'react-virtualized/dist/commonjs',
				'social-logos/example': 'social-logos/build/example',
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
		fs: 'empty',
		crypto: false,
		stream: false,
	},
	plugins: _.compact( [
		new webpack.DefinePlugin( {
			'process.env.NODE_ENV': JSON.stringify( bundleEnv ),
			PROJECT_NAME: JSON.stringify( config( 'project' ) ),
		} ),
		new webpack.IgnorePlugin( /^props$/ ),
		new CopyWebpackPlugin( [
			{ from: 'node_modules/flag-icon-css/flags/4x3', to: 'images/flags' },
		] ),
		new HappyPack( {
			loaders: _.compact( [
				isDevelopment && config.isEnabled( 'webpack/hot-loader' ) && 'react-hot-loader',
				babelLoader,
			] ),
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
			path: path.join( __dirname, 'server', 'bundler' ),
		} ),
		process.env.NODE_ENV === 'production' && new webpack.optimize.ModuleConcatenationPlugin(),
	] ),
	externals: [ 'electron' ],
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
		'immutable',
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
		new webpack.optimize.CommonsChunkPlugin( {
			async: 'tinymce',
			minChunks: ( { resource } ) => resource && /node_modules[\/\\]tinymce/.test( resource ),
		} ),
		new webpack.optimize.CommonsChunkPlugin( { name: 'manifest' } ),
	] );

	// jquery is only needed in the build for the desktop app
	// see electron bug: https://github.com/atom/electron/issues/254
	webpackConfig.externals.push( 'jquery' );
}

if ( isDevelopment ) {
	// we should not use chunkhash in development: https://github.com/webpack/webpack-dev-server/issues/377#issuecomment-241258405
	// also we don't minify so dont name them .min.js
	webpackConfig.output.filename = '[name].js';
	webpackConfig.output.chunkFilename = '[name].js';

	webpackConfig.plugins = webpackConfig.plugins.concat( [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.LoaderOptionsPlugin( { debug: true } ),
	] );
	webpackConfig.entry.build = [
		'webpack-hot-middleware/client',
		path.join( __dirname, 'client', 'boot', 'app' ),
	];
	webpackConfig.devServer = { hot: true, inline: true };
} else {
	webpackConfig.entry.build = path.join( __dirname, 'client', 'boot', 'app' );
}

if ( ! config.isEnabled( 'desktop' ) ) {
	webpackConfig.plugins.push(
		new webpack.NormalModuleReplacementPlugin( /^lib[\/\\]desktop$/, 'lodash/noop' )
	);
}

if ( config.isEnabled( 'webpack/persistent-caching' ) ) {
	webpackConfig.recordsPath = path.join( __dirname, '.webpack-cache', 'client-records.json' );
	webpackConfig.plugins.unshift(
		new HardSourceWebpackPlugin( {
			cacheDirectory: path.join( __dirname, '.webpack-cache', 'client' ),
		} )
	);
}

if ( shouldMinify ) {
	webpackConfig.plugins.push(
		new UglifyJsPlugin( {
			cache: 'docker' !== process.env.CONTAINER,
			parallel: true,
			uglifyOptions: { ecma: 5 },
			sourceMap: Boolean( process.env.SOURCEMAP ),
		} )
	);
}

module.exports = webpackConfig;
