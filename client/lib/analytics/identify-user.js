/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import { recordAliasInFloodlight } from 'lib/analytics/ad-tracking';
import {
	identifyUser as baseIdentifyUser,
	getTracksAnonymousUserId,
	getCurrentUser,
} from '@automattic/calypso-analytics';

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
