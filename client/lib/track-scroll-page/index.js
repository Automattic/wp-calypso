/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { bumpStat } from 'lib/analytics/mc';

export default function( path, title, category, page ) {
	analytics.ga.recordEvent( category, 'Loaded Next Page', 'page', page );
	analytics.pageView.record( path, title );
	bumpStat( 'newdash_pageviews', 'scroll' );
}
