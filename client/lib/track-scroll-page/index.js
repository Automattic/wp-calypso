/**
 * Internal dependencies
 */
import { recordPageView } from 'calypso/lib/analytics/page-view';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';

export default function ( path, title, category, page ) {
	gaRecordEvent( category, 'Loaded Next Page', 'page', page );
	recordPageView( path, title );
	bumpStat( 'newdash_pageviews', 'scroll' );
}
