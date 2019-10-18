const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {
	entry: './packages/wp-checkout/demo/index.js',
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
	resolve: { extensions: [ '*', '.js', '.jsx' ] },
	output: {
		path: path.resolve( __dirname, '/packages/wp-checkout/dist/' ),
		publicPath: '/dist/',
		filename: 'bundle.js',
	},
	devServer: {
		contentBase: path.join( __dirname, '/packages/wp-checkout/demo/' ),
		port: 3000,
		publicPath: 'http://localhost:3000/dist/',
		hotOnly: true,
	},
	plugins: [ new webpack.HotModuleReplacementPlugin() ],
};
