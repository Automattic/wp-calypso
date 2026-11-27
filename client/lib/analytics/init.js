import {
	initializeAnalytics as initializeCalypsoAnalytics,
	getTracksAnonymousUserId,
	getCurrentUser,
} from '@automattic/calypso-analytics';
import debugModule from 'debug';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:analytics:init' );

export async function initializeAnalytics( currentUser, superProps ) {
	await initializeCalypsoAnalytics( currentUser, superProps );
	const user = getCurrentUser();

	// This block is necessary because calypso-analytics/initializeAnalytics no longer calls out to ad-tracking
	if ( 'object' === typeof currentUser && user && getTracksAnonymousUserId() ) {
		// Ad blockers can block this chunk by its name.
		const mod = await import(
			/* webpackChunkName: "lib-analytics-ad-tracking-record-alias-in-floodlight" */
			'calypso/lib/analytics/ad-tracking/record-alias-in-floodlight'
		).catch( () => null );
		if ( ! mod ) {
			debug( 'Failed to load the Floodlight alias chunk' );
			return;
		}
		const { recordAliasInFloodlight } = mod;
		debug( 'recordAliasInFloodlight', user );
		recordAliasInFloodlight();
	}
}
