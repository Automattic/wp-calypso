/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import {
	initializeAnalytics as initializeCalypsoAnalytics,
	getTracksAnonymousUserId,
	getCurrentUser,
} from '@automattic/calypso-analytics';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:analytics:init' );

export async function initializeAnalytics( currentUser, superProps ) {
	await initializeCalypsoAnalytics( currentUser, superProps );
	const user = getCurrentUser();

	// This block is necessary because calypso-analytics/initializeAnalytics no longer calls out to ad-tracking
	if ( 'object' === typeof currentUser && user && getTracksAnonymousUserId() ) {
		const mod = await import(
			/* webpackChunkName: "lib-analytics-ad-tracking-record-alias-in-floodlight" */
			'lib/analytics/ad-tracking/record-alias-in-floodlight'
		);
		const { recordAliasInFloodlight } = mod;
		debug( 'recordAliasInFloodlight', user );
		recordAliasInFloodlight();
	}
}
