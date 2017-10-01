/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to fetch the Jetpack credentials. False otherwise
 * Returns null if the status for the queried site is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {Boolean}            Whether Jetpack credentials are currently being requested
 */
export default function isRequestingJetpackCredentials( state, siteId ) {
	return get( state.jetpack.credentials.requests, [ siteId, 'requesting' ], null );
}
