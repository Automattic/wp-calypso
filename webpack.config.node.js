/**
 * **** WARNING: No ES6 modules here. Not transpiled! ****
 *
 * @format
 */

/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const _ = require( 'lodash' );
const os = require( 'os' );

/**
 * Internal dependencies
 */
const cacheIdentifier = require( './server/bundler/babel/babel-loader-cache-identifier' );
const config = require( 'config' );
const bundleEnv = config( 'env' );

/**
 * Internal variables
 */
const isDevelopment = bundleEnv === 'development';

const commitSha = process.env.hasOwnProperty( 'COMMIT_SHA' ) ? process.env.COMMIT_SHA : '(unknown)';

/**
 * This lists modules that must use commonJS `require()`s
 * All modules listed here need to be ES5.
 *
 * @returns { object } list of externals
 */
function getExternals() {
	const externals = {};

	// Don't bundle any node_modules, both to avoid a massive bundle, and problems
	// with modules that are incompatible with webpack bundling.
	fs.readdirSync( 'node_modules' )
		.filter( function( module ) {
			return [ '.bin' ].indexOf( module ) === -1;
		} )
		.forEach( function( module ) {
			externals[ module ] = 'commonjs ' + module;
		} );

	// Don't bundle webpack.config, as it depends on absolute paths (__dirname)
	externals[ 'webpack.config' ] = 'commonjs webpack.config';
	// Exclude hot-reloader, as webpack will try and resolve this in production builds,
	// and error.
	externals[ 'bundler/hot-reloader' ] = 'commonjs bundler/hot-reloader';
	// Exclude the devdocs search-index, as it's huge.
	externals[ 'devdocs/search-index' ] = 'commonjs devdocs/search-index';
	// Exclude the devdocs components usage stats data
	externals[ 'devdocs/components-usage-stats.json' ] =
		'commonjs devdocs/components-usage-stats.json';
	// Exclude server/bundler/assets, since the files it requires don't exist until the bundler has run
	externals[ 'bundler/assets' ] = 'commonjs bundler/assets';
	// Map React and redux to the minimized version in production
	if ( config( 'env' ) === 'production' ) {
		externals.react = 'commonjs react/umd/react.production.min.js';
		externals.redux = 'commonjs redux/dist/redux.min';
	}

	return externals;
}

const babelLoader = {
	loader: 'babel-loader',
	options: {
		cacheDirectory: path.join( __dirname, 'build', '.babel-server-cache' ),
		cacheIdentifier,
	},
};

const webpackConfig = {
	devtool: 'source-map',
	entry: './index.js',
	target: 'node',
	output: {
		path: path.join( __dirname, 'build' ),
		filename: 'bundle.js',
	},
	mode: isDevelopment ? 'development' : 'production',
	optimization: { minimize: false },
	module: {
		rules: [
			{
				test: /extensions[\/\\]index/,
				exclude: path.join( __dirname, 'node_modules' ),
				loader: path.join( __dirname, 'server', 'bundler', 'extensions-loader' ),
			},
			{
				include: path.join( __dirname, 'client/sections.js' ),
				use: {
					loader: path.join( __dirname, 'server', 'bundler', 'sections-loader' ),
					options: { forceRequire: true, onlyIsomorphic: true },
				},
			},
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|devdocs[\/\\]search-index)/,
				use: [
					{
						loader: 'thread-loader',
						options: { workers: Math.max( 2, Math.floor( os.cpus().length / 2 ) ) },
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
		],
	},
	resolve: {
		modules: [
			__dirname,
			path.join( __dirname, 'server' ),
			path.join( __dirname, 'client' ),
			path.join( __dirname, 'client', 'extensions' ),
			'node_modules',
		],
		extensions: [ '.json', '.js', '.jsx' ],
		alias: {
			'components/': '@automattic/simple-components/',
		},
	},
	node: {
		// Tell webpack we want to supply absolute paths for server code,
		// specifically needed by the client code bundler.
		__filename: true,
		__dirname: true,
	},
	plugins: _.compact( [
		// Require source-map-support at the top, so we get source maps for the bundle
		new webpack.BannerPlugin( {
			banner: 'require( "source-map-support" ).install();',
			raw: true,
			entryOnly: false,
		} ),
		new webpack.DefinePlugin( {
			PROJECT_NAME: JSON.stringify( config( 'project' ) ),
			COMMIT_SHA: JSON.stringify( commitSha ),
			'process.env.NODE_ENV': JSON.stringify( bundleEnv ),
		} ),
		new webpack.NormalModuleReplacementPlugin( /^lib[\/\\]abtest$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^lib[\/\\]analytics$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^lib[\/\\]user$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin(
			/^components[\/\\]popover$/,
			'components/null-component'
		), // Depends on BOM and interactions don't work without JS
		new webpack.NormalModuleReplacementPlugin(
			/^my-sites[\/\\]themes[\/\\]theme-upload$/,
			'components/empty-component'
		), // Depends on BOM
	] ),
	externals: getExternals(),
};

if ( ! config.isEnabled( 'desktop' ) ) {
	webpackConfig.plugins.push(
		new webpack.NormalModuleReplacementPlugin( /^lib[\/\\]desktop$/, 'lodash/noop' )
	);
}

module.exports = webpackConfig;
