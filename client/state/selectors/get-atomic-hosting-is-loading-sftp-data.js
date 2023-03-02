import 'calypso/state/hosting/init';
import { getAtomicHostingIsLoadingSftpUsers } from './get-atomic-hosting-is-loading-sftp-users';
import { getAtomicHostingIsLoadingSshAccess } from './get-atomic-hosting-is-loading-ssh-access';

/**
 * Returns the sftp users details for given site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId The ID of the site we're querying
 * @returns {Array} List of SFTP user details
 */
export function getAtomicHostingIsLoadingSftpData( state, siteId ) {
	return (
		getAtomicHostingIsLoadingSftpUsers( state, siteId ) ||
		getAtomicHostingIsLoadingSshAccess( state, siteId )
	);
}
