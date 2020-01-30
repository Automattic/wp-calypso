module.exports = {
	entry: __dirname + '/source.js',

	node: {
		fs: 'empty',
	},

	output: {
		path: __dirname + '/built',
		filename: 'app.js',
		libraryTarget: 'var',
		library: 'WPCOM',
	},

	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
		],
	},

	resolve: {
		extensions: [ '', '.js' ],
	},

	devtool: 'sourcemap',
};
