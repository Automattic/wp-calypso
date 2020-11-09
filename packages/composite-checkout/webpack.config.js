const path = require( 'path' );

module.exports = {
	entry: './src/public-api.js',
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
				use: [
					{
						loader: 'cache-loader',
						options: {
							cacheDirectory: path.resolve( process.env.HOME, '.cache', 'webpack', 'css' ),
						},
					},
					'style-loader',
					'css-loader',
				],
			},
		],
	},
	resolve: { extensions: [ '*', '.js', '.jsx' ] },
	output: {
		path: path.resolve( __dirname, 'dist/' ),
		publicPath: '/dist/',
		filename: 'bundle.js',
	},
};
