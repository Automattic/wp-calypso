const path = require( 'path' );

module.exports = [
	{
		path: path.join( __dirname, 'dist/build.min.js' ),
		// Bumped for the React 19 / @wordpress/element 7 upgrade, which grows the
		// gzipped bundle by ~33 KB (495 KiB -> ~528 KiB observed). Headroom added
		// for CI/local build variance.
		limit: '545 KiB',
	},
	{
		path: path.join( __dirname, 'dist/widget-loader.min.js' ),
		limit: '8 KiB',
	},
];
