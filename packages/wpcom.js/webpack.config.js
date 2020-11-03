const path = require( 'path' );

module.exports = {
	mode: 'production',
	entry: path.join( __dirname, 'dist/esm/index.js' ),
	output: {
		path: path.join( __dirname, 'dist' ),
		filename: 'wpcom.js',
		libraryTarget: 'var',
		library: 'WPCOM',
	},
	devtool: 'sourcemap',
};
