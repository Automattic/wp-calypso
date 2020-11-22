/**
 * Internal dependencies
 */
import { isAdTrackingAllowed } from 'calypso/lib/analytics/utils';
import { debug, isFloodlightEnabled } from './constants';
import { recordParamsInFloodlightGtag } from './floodlight';

// Ensure setup has run.
import './setup';

/**
 * Records the anonymous user id and wpcom user id in DCM Floodlight
 *
 * @returns {void}
 */
export function recordAliasInFloodlight() {
	if ( ! isAdTrackingAllowed() || ! isFloodlightEnabled ) {
		return;
	}

	debug( 'recordAliasInFloodlight: Aliasing anonymous user id with WordPress.com user id' );

	debug( 'recordAliasInFloodlight:' );
	recordParamsInFloodlightGtag( {
		send_to: 'DC-6355556/wordp0/alias0+standard',
	} );
}
