module.exports = {
	entry: __dirname + '/index.js',

	node: {
		fs: 'empty'
	},

	output: {
		path: __dirname + '/dist',
		filename: 'wpcom.js',
		libraryTarget: 'var',
		library: 'WPCOM'
	},

	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					cacheDirectory: true,
					optional: [ 'runtime' ]
				}
			},
			{
				test: /\.json$/,
				exclude: /node_modules/,
				loader: 'json-loader'
			}
		]
	},

	resolve: {
		extensions: [ '', '.js', '.json' ]
	},

	devtool: 'sourcemap'
};
