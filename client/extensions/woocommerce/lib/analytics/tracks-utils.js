/**
 * Internal dependencies
 */
import { bumpStat } from 'state/analytics/actions';
import { WOOCOMMERCE_STAT_DISCARDED } from 'woocommerce/state/action-types';

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

	tracks.recordTracksEvent( eventName, eventProperties );
};

export const bumpMCStat = ( debug, tracksStore ) => ( group, name ) => {
	debug( `stat bump ${ group }: ${ name }` );

	if ( tracksStore.isTestSite() ) {
		debug( 'stat bump discarded. this site is flagged with `dotcom-store-test-site`' );
		return { type: WOOCOMMERCE_STAT_DISCARDED, group, name };
	}

	return bumpStat( group, name );
};
