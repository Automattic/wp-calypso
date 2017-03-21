/**
 * Internal Dependencies
 */
var analytics = require( 'lib/analytics' );

export default function( path, title, category, page ) {
	analytics.ga.recordEvent( category, 'Loaded Next Page', 'page', page );
	analytics.pageView.record( path, title );
	analytics.mc.bumpStat( 'newdash_pageviews', 'scroll' );
};
