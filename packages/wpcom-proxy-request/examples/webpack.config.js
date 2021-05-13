const path = require( 'path' );

module.exports = {
	entry: path.join( __dirname, '../build/index.js' ),

	node: {
		fs: 'empty',
	},

	output: {
		path: path.join( __dirname, 'dist/' ),
		filename: 'wpcom-proxy-request.js',
		libraryTarget: 'var',
		library: 'WPCOMProxyRequest',
	},

	resolve: {
		extensions: [ '', '.js' ],
	},

	devtool: 'sourcemap',
};
