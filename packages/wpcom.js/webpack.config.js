module.exports = {
	entry: __dirname + '/build/index.js',

	output: {
		path: __dirname + '/build',
		filename: 'wpcom.js',
		libraryTarget: 'var',
		library: 'WPCOM'
	},

	resolve: {
		extensions: [ '', '.js' ]
	},

	devtool: 'sourcemap'
};
