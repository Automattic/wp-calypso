/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently making a request to fetch the Jetpack settings. False otherwise
 * Returns null if the status for the queried site is unknown.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {?Boolean}            Whether Jetpack settings are currently being requested
 */
export default function isRequestingJetpackSettings( state, siteId ) {
	return get( state.jetpack.settings.requests, [ siteId, 'requesting' ], null );
}
