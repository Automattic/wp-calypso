module.exports = {
	mode: 'production',
	entry: __dirname + '/build/index.js',
	output: {
		path: __dirname + '/build',
		filename: 'wpcom.js',
		libraryTarget: 'var',
		library: 'WPCOM',
	},
	devtool: 'sourcemap',
};
