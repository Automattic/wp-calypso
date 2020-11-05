const path = require( 'path' );
const cachePath = path.resolve( '.cache', 'calypso-stripe' );

module.exports = {
	entry: './index.ts',
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
							cacheDirectory: path.resolve( cachePath, 'css' ),
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
