import { bumpStat } from 'calypso/lib/analytics/mc';
import { getLocation } from './get-location';
import { recordTracksRailcarInteract } from './railcar-helpers';
import { recordAction } from './record-action';
import { recordGaEvent } from './record-ga-event';
import { recordTrack } from './record-track';
import type { ReaderEventProperties, ReaderRailcar } from './types';

export function recordFollow(
	url: string,
	railcar: ReaderRailcar | null,
	additionalProps: ReaderEventProperties = {}
) {
	const source = String( additionalProps.follow_source || getLocation( window.location.pathname ) );
	bumpStat( 'reader_follows', source );
	recordAction( 'followed_blog' );
	recordGaEvent( 'Clicked Follow Blog', source );
	recordTrack( 'calypso_reader_site_followed', {
		url,
		source,
		...additionalProps,
	} );

	if ( railcar ) {
		recordTracksRailcarInteract( 'site_followed', railcar );
	}
}
