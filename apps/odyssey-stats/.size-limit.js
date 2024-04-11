const path = require( 'path' );

module.exports = [
	{
		path: path.join( __dirname, 'dist/build.min.js' ),
		limit: '385 KiB',
	},
	{
		path: path.join( __dirname, 'dist/widget-loader.min.js' ),
		limit: '8 KiB',
	},
];
