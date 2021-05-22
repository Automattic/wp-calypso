const path = require( 'path' );

module.exports = {
	entry: path.join( __dirname, 'source.js' ),

	node: {
		fs: 'empty',
	},

	output: {
		path: path.join( __dirname, 'built' ),
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
