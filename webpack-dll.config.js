/**
 * External Dependencies
 */
const path = require( 'path' );
const webpack = require( 'webpack' );

/**
 * Internal Dependencies
 */
const config = require( './server/config' );

const bundleEnv = config( 'env' );

module.exports = {
	entry: {
		vendor: [
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
		]
	},
	output: {
		path: path.join( __dirname, 'public' ),
		publicPath: '/calypso/',
		filename: '[name].js',
		library: '[name]',
		devtoolModuleFilenameTemplate: 'app:///[resource-path]'
	},
	plugins: [
		new webpack.DllPlugin( {
			path: path.join( __dirname, 'build', 'dll', '[name]-manifest.json' ),
			name: '[name]',
			context: path.resolve( __dirname, 'client' )
		} ),
		new webpack.DefinePlugin( {
			'process.env': {
				NODE_ENV: JSON.stringify( bundleEnv )
			}
		} ),
		new webpack.optimize.OccurenceOrderPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.json$/,
				loader: 'json-loader'
			},
			{
				test: /\.html$/,
				loader: 'html-loader'
			}
		]
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
	resolve: {
		root: path.resolve( __dirname, 'client' )
	}
};
