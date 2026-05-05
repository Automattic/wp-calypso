import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

export const FEDIVERSE_EVENTS = {
	CONNECT_STARTED: 'reader_fediverse_connect_started',
	CAPABILITY_CHECK: 'reader_fediverse_capability_check',
	FEATURE_ENABLED: 'reader_fediverse_feature_enabled',
	C2S_ENABLED: 'reader_fediverse_c2s_enabled',
	USER_ACTORS_ENABLED: 'reader_fediverse_user_actors_enabled',
	AUTHORIZE_STARTED: 'reader_fediverse_authorize_started',
	CONNECT_COMPLETED: 'reader_fediverse_connect_completed',
	CONNECT_FAILED: 'reader_fediverse_connect_failed',
	NOTE_POSTED: 'reader_fediverse_note_posted',
	NOTE_FAILED: 'reader_fediverse_note_failed',
	DISCONNECTED: 'reader_fediverse_disconnected',
} as const;

export function trackFediverseEvent(
	event: keyof typeof FEDIVERSE_EVENTS,
	props: Record< string, unknown > = {}
) {
	return recordReaderTracksEvent( FEDIVERSE_EVENTS[ event ], props );
}
