import {
	identifyUser as baseIdentifyUser,
	getTracksAnonymousUserId,
	getCurrentUser,
} from '@automattic/calypso-analytics';
import debugModule from 'debug';
import { recordAliasInFloodlight } from 'calypso/lib/analytics/ad-tracking';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:analytics:identifyUser' );

export function identifyUser( userData ) {
	baseIdentifyUser( userData );

	// neccessary because calypso-analytics/initializeAnalytics no longer calls out to ad-tracking
	const user = getCurrentUser();
	if ( 'object' === typeof userData && user && getTracksAnonymousUserId() ) {
		debug( 'recordAliasInFloodlight', user );
		recordAliasInFloodlight();
	}
}
