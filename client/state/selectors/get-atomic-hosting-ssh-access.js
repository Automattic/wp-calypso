import 'calypso/state/hosting/init';

/**
 * Returns the SSH access status for given site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId The ID of the site we're querying
 * @returns {string} SSH access status
 */
export function getAtomicHostingSshAccess( state, siteId ) {
	return state.atomicHosting?.[ siteId ]?.sshAccess ?? null;
}
