const path = require( 'path' );

module.exports = {
	mode: 'production',
	entry: path.join( __dirname, 'main.js' ),
	output: {
		path: __dirname,
		filename: 'webapp-bundle.js',
		libraryTarget: 'var',
		library: 'WPCOMWebApp',
	},
};
