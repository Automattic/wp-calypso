const path = require( 'path' );
const UglifyJSPlugin = require( 'uglifyjs-webpack-plugin' );
const webpack = require( 'webpack' );

const config = {
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
		],
	},
	output: {
		filename: '[name].[chunkhash].min.js', // prefer the chunkhash, which depends on the chunk, not the entire build
		chunkFilename: '[name].[chunkhash].min.js', // ditto
		path: path.resolve( 'login-build' ),
	},
	module: {
		loaders: [
				{ test: /\.js$/, loader: 'babel-loader', exclude: /node_modules[\/\\](?!notifications-panel)/ },
				{ test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules[\/\\](?!notifications-panel)/ },
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
			'process.env.NODE_ENV': JSON.stringify( 'production' ),
			PROJECT_NAME: JSON.stringify( 'wordpress-com' ),
			COMMIT_SHA: JSON.stringify( '123fffeee' ),
		} ),
		new UglifyJSPlugin(),
		new webpack.optimize.CommonsChunkPlugin( { name: 'vendor', minChunks: Infinity } ),
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
