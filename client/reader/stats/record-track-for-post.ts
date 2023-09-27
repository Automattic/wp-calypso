import { ALLOWED_TRACKS_RAILCAR_EVENT_NAMES } from './constants';
import { getTracksPropertiesForPost } from './get-tracks-properties-for-post';
import { recordTracksRailcarInteract } from './railcar-helpers';
import { recordTrack } from './record-track';
import type { ReaderEventProperties, ReaderPost } from './types';

export function recordTrackForPost(
	eventName: string,
	post: ReaderPost | null | undefined,
	additionalProps: ReaderEventProperties = {},
	options = {}
): void {
	const propsForPost = post ? getTracksPropertiesForPost( post ) : {};
	recordTrack( eventName, { ...propsForPost, ...additionalProps }, options );

	if ( ! post || ! post.railcar ) {
		return;
	}

	if ( ALLOWED_TRACKS_RAILCAR_EVENT_NAMES.has( eventName ) ) {
		recordTracksRailcarInteract( eventName, post.railcar, additionalProps );
	} else if ( process.env.NODE_ENV !== 'production' ) {
		// eslint-disable-next-line no-console
		console.warn( 'Consider allowing reader track', eventName );
	}
}
