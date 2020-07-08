/**
 * Internal dependencies
 */
import { recordPageView } from 'lib/analytics/page-view';
import { bumpStat } from 'lib/analytics/mc';
import { gaRecordEvent } from 'lib/analytics/ga';

export default function ( path, title, category, page ) {
	gaRecordEvent( category, 'Loaded Next Page', 'page', page );
	recordPageView( path, title );
	bumpStat( 'newdash_pageviews', 'scroll' );
}
