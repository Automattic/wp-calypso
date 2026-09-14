const path = require( 'path' );

module.exports = [
	{
		path: path.join( __dirname, 'dist/build.min.js' ),
		// Bumped for the React 19 / @wordpress/element 7 upgrade, which grows the
		// gzipped bundle by ~33 KB (495 KiB -> ~528 KiB observed). Headroom added
		// for CI/local build variance.
		// Bumped again to restore headroom eaten up by recent Stats changes on
		// trunk. #112995 trims moment-timezone data out of this bundle and will
		// bring the real size back down; revert this bump once that lands.
		limit: '570 KiB',
	},
	{
		path: path.join( __dirname, 'dist/widget-loader.min.js' ),
		limit: '10 KiB',
	},
];
