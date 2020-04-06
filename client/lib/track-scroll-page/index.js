/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { bumpStat } from 'lib/analytics/mc';
import { gaRecordEvent } from 'lib/analytics/ga';

export default function( path, title, category, page ) {
	gaRecordEvent( category, 'Loaded Next Page', 'page', page );
	analytics.pageView.record( path, title );
	bumpStat( 'newdash_pageviews', 'scroll' );
}
