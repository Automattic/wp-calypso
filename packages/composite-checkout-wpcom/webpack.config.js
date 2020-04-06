const path = require( 'path' );

module.exports = {
	entry: './src/public-api.js',
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				exclude: /node_modules/,
				loader: 'ts-loader',
			},
			{
				test: /\.jsx$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader',
				options: { presets: [ '@babel/env' ] },
			},
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'source-map-loader',
			},
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ],
			},
		],
	},
	resolve: { extensions: [ '*', '.js', '.jsx', '.ts', '.tsx' ] },
	output: {
		path: path.resolve( __dirname, 'dist/' ),
		publicPath: '/dist/',
		filename: 'bundle.js',
	},
};
