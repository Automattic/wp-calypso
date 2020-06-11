// This is to build a browser version
const path = require( 'path' );
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
