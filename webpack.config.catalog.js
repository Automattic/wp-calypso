const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {
	entry: './catalog/public/index.js',
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
		path: path.resolve( __dirname, '/catalog/dist/' ),
		publicPath: '/catalog/dist/',
		filename: 'bundle.js',
	},
	devServer: {
		contentBase: path.join( __dirname, '/catalog/public/' ),
		port: 3000,
		publicPath: 'http://localhost:3000/catalog/dist/',
		hotOnly: true,
	},
	plugins: [ new webpack.HotModuleReplacementPlugin() ],
};
