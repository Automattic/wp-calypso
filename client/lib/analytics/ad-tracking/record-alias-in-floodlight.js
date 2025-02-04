import { mayWeTrackByTracker } from '../tracker-buckets';
import { debug } from './constants';
import { recordParamsInFloodlightGtag } from './floodlight';

// Ensure setup has run.
import './setup';

/**
 * Records the anonymous user id and wpcom user id in DCM Floodlight
 * @returns {void}
 */
export function recordAliasInFloodlight() {
	if ( ! mayWeTrackByTracker( 'floodlight' ) ) {
		return;
	}

	debug( 'recordAliasInFloodlight: Aliasing anonymous user id with WordPress.com user id' );

	debug( 'recordAliasInFloodlight:' );
	recordParamsInFloodlightGtag( {
		send_to: 'DC-6355556/wordp0/alias0+standard',
	} );
}
