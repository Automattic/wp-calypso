import 'calypso/state/hosting/init';
import { getAtomicHostingIsLoadingSftpUsers } from './get-atomic-hosting-is-loading-sftp-users';
import { getAtomicHostingIsLoadingSshAccess } from './get-atomic-hosting-is-loading-ssh-access';

/**
 * Returns if the SFTP users and SSH access data have loaded for given site.
 * @param  {Object}  state   Global state tree
 * @param  {number|null}  siteId The ID of the site we're querying
 * @returns {boolean} If the SFTP users and SSH access data has finished the first request
 */
export function getAtomicHostingIsLoadingSftpData( state, siteId ) {
	return (
		getAtomicHostingIsLoadingSftpUsers( state, siteId ) ||
		getAtomicHostingIsLoadingSshAccess( state, siteId )
	);
}
