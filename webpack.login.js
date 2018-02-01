const _ = require( 'lodash' );
const fs = require( 'fs' );
const path = require( 'path' );
const UglifyJSPlugin = require( 'uglifyjs-webpack-plugin' );
const webpack = require( 'webpack' );

// load in the babel config from babelrc and disable commonjs transform
// this enables static analysis from webpack including treeshaking
// also disable add-module-exports. TODO: remove add-module-exports from babelrc. requires fixing tests
const babelConfig = JSON.parse( fs.readFileSync( './.babelrc', { encoding: 'utf8' } ) );
const babelPresetEnv = _.find( babelConfig.presets, preset => preset[ 0 ] === 'env' );
babelPresetEnv[ 1 ].modules = false;
_.remove( babelConfig.plugins, elem => elem === 'add-module-exports' );

const cacheIdentifier = require( './server/bundler/babel/babel-loader-cache-identifier' );

const babelLoader = {
	loader: 'babel-loader',
	options: Object.assign( {}, babelConfig, {
		babelrc: false,
		cacheDirectory: path.join( __dirname, 'build', '.babel-client-cache' ),
		cacheIdentifier: cacheIdentifier,
		plugins: [
			...babelConfig.plugins,
			path.resolve( 'inline-imports.js' ),
		],
	} ),
};

const config = {
	devtool: 'source-map',
	entry: {
		build: path.join( path.resolve( __dirname ), 'client', 'boot', 'loggedout-app' ),
		vendor: [
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
			'debug',
		],
	},
	output: {
		filename: '[name].[chunkhash].min.js', // prefer the chunkhash, which depends on the chunk, not the entire build
		chunkFilename: '[name].[chunkhash].min.js', // ditto
		path: path.resolve( 'login-build' ),
	},
	module: {
		loaders: [
				{ test: /\.js$/, loader: babelLoader, exclude: /node_modules[\/\\](?!notifications-panel)/ },
				{ test: /\.jsx$/, loader: babelLoader, exclude: /node_modules[\/\\](?!notifications-panel)/ },
		],
	},
	resolve: {
		extensions: [ '.json', '.js', '.jsx' ],
		modules: [ path.join( path.resolve( __dirname ), 'client' ), 'node_modules' ],
		alias: Object.assign(
			{
				'react-virtualized': 'react-virtualized/dist/commonjs',
				'social-logos/example': 'social-logos/build/example',
			}, {}
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
	},
	plugins: [
		new webpack.DefinePlugin( {
			'process.env.NODE_ENV': JSON.stringify( 'development' ),
			PROJECT_NAME: JSON.stringify( 'wordpress-com' ),
			COMMIT_SHA: JSON.stringify( '123fffeee' ),
		} ),
		new UglifyJSPlugin(),
		new webpack.optimize.CommonsChunkPlugin( { name: 'vendor', minChunks: Infinity } ),
		new webpack.optimize.CommonsChunkPlugin( { name: 'manifest' } ),
		new webpack.NormalModuleReplacementPlugin(
			/layout-wrapper\/logged-in/,
			'lodash/noop'
		),
		new webpack.NormalModuleReplacementPlugin(
			/^lib[\/\\]desktop$/,
			'lodash/noop'
		),
	],
	externals: [
		'jquery',
	],
};

module.exports = config;
