/**
 * Internal dependencies
 */
import { bumpStat } from 'calypso/state/analytics/actions';

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

export const bumpMCStat = ( debug ) => ( group, name ) => {
	debug( `stat bump ${ group }: ${ name }` );

	return bumpStat( group, name );
};
