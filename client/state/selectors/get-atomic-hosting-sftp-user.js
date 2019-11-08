/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the sftp user details for given site and user
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId The ID of the site we're querying
 * @param  {Number}  userId  The ID of the user we're querying
 * @return {Object} SFTP user details for selected user
 */
export function getAtomicHostingSFTPUser( state, siteId, userId ) {
	return get( state, [ 'atomicHosting', 'sites', siteId, 'sftpUsers', userId ], null );
}
