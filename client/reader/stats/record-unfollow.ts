import { bumpStat } from 'calypso/lib/analytics/mc';
import { getLocation } from './get-location';
import { recordTracksRailcarInteract } from './railcar-helpers';
import { recordAction } from './record-action';
import { recordGaEvent } from './record-ga-event';
import { recordTrack } from './record-track';
import type { ReaderEventProperties, ReaderRailcar } from './types';

export function recordUnfollow(
	url: string,
	railcar: ReaderRailcar,
	additionalProps: ReaderEventProperties = {}
): void {
	const source = String( additionalProps.follow_source || getLocation( window.location.pathname ) );
	bumpStat( 'reader_unfollows', source );
	recordAction( 'unfollowed_blog' );
	recordGaEvent( 'Clicked Unfollow Blog', source );
	recordTrack( 'calypso_reader_site_unfollowed', {
		url,
		source,
		...additionalProps,
	} );

	if ( railcar ) {
		recordTracksRailcarInteract( 'site_unfollowed', railcar );
	}
}
