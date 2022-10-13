import 'calypso/state/hosting/init';

/**
 * Returns the ssh keys details for given site.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId The ID of the site we're querying
 * @returns {Array} List of SSH key details
 */
export function getAtomicHostingSshKeys( state, siteId ) {
	return state.atomicHosting?.[ siteId ]?.sshKeys ?? [];
}
