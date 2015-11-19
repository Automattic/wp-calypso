module.exports = {
	entry: __dirname + '/index.js',
	node: {
		fs: "empty"
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
				loader: 'babel-loader'
			}
		]
	},
	resolve: {
		extensions: ['', '.js']
	},
	devtool: 'sourcemap'
};
