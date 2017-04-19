/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently performing a request to fetch the site connection status.
 * False otherwise.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {Boolean}             Whether connection status is currently being requested for that site.
 */
export default function isRequestingSiteConnectionStatus( state, siteId ) {
	return get( state.sites.connection.requesting, siteId, false );
}
