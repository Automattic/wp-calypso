import { bumpStat } from 'calypso/lib/analytics/mc';
import { recordGaEvent } from './record-ga-event';
import { recordTrack } from './record-track';
import { recordTrackForPost } from './record-track-for-post';
import type { ReaderPost } from './types';

export function recordPermalinkClick(
	source: string,
	post: ReaderPost | null | undefined,
	eventProperties = {}
) {
	bumpStat( {
		reader_actions: 'visited_post_permalink',
		reader_permalink_source: source,
	} );
	recordGaEvent( 'Clicked Post Permalink', source );
	const trackEvent = 'calypso_reader_permalink_click';

	// Add source as Tracks event property
	eventProperties = Object.assign( { source }, eventProperties );

	if ( post ) {
		recordTrackForPost( trackEvent, post, eventProperties );
	} else {
		recordTrack( trackEvent, eventProperties );
	}
}
