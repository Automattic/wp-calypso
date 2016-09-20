const path = require( 'path' );
const webpack = require( 'webpack' );
const config = require( './server/config' );

const isProduction = process.env.NODE_ENV === 'production';
const bundleEnv = isProduction ? 'production' : 'development';

const webpackConfig = {
	entry: {
		vendor: [ path.join( __dirname, 'client', 'vendor-dll.js' ) ]
	},
	output: {
		path: path.join( __dirname, 'build', 'dll' ),
		filename: 'dll.[name].[hash].' + bundleEnv + '.js',
		library: '[name]'
	},
	plugins: [
		new webpack.DllPlugin( {
			path: path.join( __dirname, 'build', 'dll', '[name].[hash].' + bundleEnv + '-manifest.json' ),
			name: '[name]',
			context: path.resolve( __dirname, 'client' )
		} ),
		new webpack.DefinePlugin( {
			'process.env': {
				NODE_ENV: JSON.stringify( config( 'env' ) )
			}
		} ),
		new webpack.optimize.OccurenceOrderPlugin()
	],
	resolve: {
		root: path.resolve( __dirname, 'client' ),
		modulesDirectories: [ 'node_modules' ]
	}
};

if ( isProduction ) {
	config.plugins.push( new webpack.optimize.UglifyJsPlugin() );
}

module.exports = webpackConfig;
