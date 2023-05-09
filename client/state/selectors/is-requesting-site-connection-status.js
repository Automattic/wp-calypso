import 'calypso/state/site-connection/init';

/**
 * Returns true if we are currently performing a request to fetch the site connection status.
 * False otherwise.
 *
 * @param  {Object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {boolean}             Whether connection status is currently being requested for that site.
 */
export default function isRequestingSiteConnectionStatus( state, siteId ) {
	return state.siteConnection.requesting[ siteId ] ?? false;
}
