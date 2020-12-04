const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {
	entry: './packages/composite-checkout/demo/index.js',
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader',
				options: { presets: [ '@babel/env' ] },
			},
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ],
			},
		],
	},
	resolve: {
		extensions: [ '*', '.js', '.jsx' ],
		mainFields: [ 'browser', 'calypso:src', 'module', 'main' ],
	},
	output: {
		path: path.resolve( __dirname, '/dist/' ),
		publicPath: '/dist/',
		filename: 'bundle.js',
	},
	devServer: {
		contentBase: path.join( __dirname, '/demo/' ),
		port: 3000,
		publicPath: 'http://localhost:3000/dist/',
		hotOnly: true,
	},
	plugins: [ new webpack.HotModuleReplacementPlugin() ],
};
