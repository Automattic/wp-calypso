
module.exports = {
	entry: __dirname + '/main.js',

	node: {
		fs: 'empty'
	},

	output: {
		path: __dirname,
		filename: 'webapp-bundle.js',
		libraryTarget: 'var',
		library: 'WPCOMWebApp'
	},

	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader'
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			}
		]
	},

	resolve: {
		extensions: [ '', '.js', '.json' ]
	},

	devtool: 'sourcemap'
};
