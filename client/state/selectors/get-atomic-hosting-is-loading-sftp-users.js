import 'calypso/state/hosting/init';

/**
 * Returns the sftp users details for given site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId The ID of the site we're querying
 * @returns {Array} List of SFTP user details
 */
export function getAtomicHostingIsLoadingSftpUsers( state, siteId ) {
	return state.atomicHosting?.[ siteId ]?.isLoadingSftpUsers ?? true;
}
