module.exports = {
	entry: __dirname + '/main.js',

	output: {
		path: __dirname,
		filename: 'webapp-bundle.js',
		libraryTarget: 'var',
		library: 'WPCOMWebApp',
	},

	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
			{
				test: /\.json$/,
				exclude: /node_modules/,
				loader: 'json-loader',
			},
		],
	},

	resolve: {
		extensions: [ '', '.js', '.json' ],
	},

	devtool: 'sourcemap',
};
