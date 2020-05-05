module.exports = {
	mode: 'production',
	entry: __dirname + '/dist/esm/index.js',
	output: {
		path: __dirname + '/dist',
		filename: 'wpcom.js',
		libraryTarget: 'var',
		library: 'WPCOM',
	},
	devtool: 'sourcemap',
};
