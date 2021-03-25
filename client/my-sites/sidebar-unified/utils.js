/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export function trackMenuItemClick( identifier ) {
	if ( typeof identifier !== 'string' || identifier === '' ) {
		return;
	}

	recordTracksEvent( `calypso_mysites_sidebar_${ identifier }_clicked` );
}
