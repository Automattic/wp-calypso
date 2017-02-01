/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to retrieve the connection status. False otherwise.
 * Returns null if the site is unknown, or there is no information yet.
 *
 * @param  {Object}   state    Global state tree
 * @param  {Number}   siteId   The ID of the site we're querying
 * @return {?Boolean}          Whether the connection status is being requested
 */
export default function isRequestingJetpackConnectionStatus( state, siteId ) {
	return get( state.jetpack.connection.requests, [ siteId ], null );
}
