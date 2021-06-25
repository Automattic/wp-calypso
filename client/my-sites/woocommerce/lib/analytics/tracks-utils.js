/**
 * External dependencies
 */
import { startsWith } from 'lodash';

export const recordTrack = ( tracks, debug ) => ( eventName, eventProperties ) => {
	if ( ! startsWith( eventName, 'calypso_woocommerce_' ) ) {
		debug( `invalid store track name: '${ eventName }', must start with 'calypso_woocommerce_'` );
		return;
	}

	debug( `track '${ eventName }': `, eventProperties || {} );

	tracks.recordTracksEvent( eventName, eventProperties );
};
