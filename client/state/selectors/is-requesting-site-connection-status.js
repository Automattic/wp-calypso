/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns true if we are currently performing a request to fetch the site connection status.
 * False otherwise.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {boolean}             Whether connection status is currently being requested for that site.
 */
export default function isRequestingSiteConnectionStatus( state, siteId ) {
	return get( state.sites.connection.requesting, siteId, false );
}
