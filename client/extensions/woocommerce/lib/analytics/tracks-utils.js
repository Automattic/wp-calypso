/** @format */

/**
 * External dependencies
 */
import { startsWith } from 'lodash';

export const recordTrack = ( tracks, debug, tracksStore ) => ( eventName, eventProperties ) => {
	if ( ! startsWith( eventName, 'calypso_woocommerce_' ) ) {
		debug( `invalid store track name: '${ eventName }', must start with 'calypso_woocommerce_'` );
		return;
	}

	debug( `track '${ eventName }': `, eventProperties || {} );

	if ( tracksStore.isTestSite() ) {
		debug( 'track request discarded. this site is flagged with `dotcom-store-test-site`' );
		return;
	}

	tracks.recordEvent( eventName, eventProperties );
};
