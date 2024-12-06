import 'calypso/state/hosting/init';

/**
 * Returns if the SFTP users data loaded for given site.
 * @param  {Object}  state   Global state tree
 * @param  {number|null}  siteId The ID of the site we're querying
 * @returns {boolean} If the SFTP users data has finished the first request
 */
export function getAtomicHostingIsLoadingSftpUsers( state, siteId ) {
	return state.atomicHosting?.[ siteId ]?.isLoadingSftpUsers ?? true;
}
