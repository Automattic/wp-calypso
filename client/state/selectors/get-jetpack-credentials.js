/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the stored Jetpack credentials for a specific site.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId The ID of the site we're querying
 * @return {Boolean}        Whether Jetpack credentials are currently being requested
 */
export default function getJetpackCredentials( state, siteId ) {
	return get( state.jetpack.credentials.items, siteId, null );
}
