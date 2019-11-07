/** @format */

/**
 * Internal dependencies
 */

import { combineReducers } from 'state/utils';
import {
	HOSTING_CREATE_SFTP_USER,
	HOSTING_RECEIVE_SFTP_USER,
	HOSTING_RECEIVE_SFTP_USER_ERROR,
	HOSTING_REQUEST_SFTP_USER,
	HOSTING_RESET_SFTP_PASSWORD,
} from 'state/action-types';

/**
 * Responsible for the stfp user details for Atomic sites. Currently this handles
 * the current admin user only, but is structured to be able to handle all sftp
 * user details for a given site in the future releases of this feature.
 * atomicHosting: {
 *      [ siteId ]: {
 *          [ sftpUsers ]: {
 *              [ userId ]: {
 *                  userName: 'smithers-jones',
 *                  password: 'super-secret'
 *              }
 *          }
 *      }
 * }
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
const sites = ( state = {}, action ) => {
	const { siteId, userId } = action;
	const site = state[ siteId ] ? state[ siteId ] : {};

	switch ( action.type ) {
		case HOSTING_RESET_SFTP_PASSWORD:
		case HOSTING_CREATE_SFTP_USER:
		case HOSTING_REQUEST_SFTP_USER: {
			const sftpUsers = { ...site.sftpUsers, [ userId ]: { isLoading: true } };
			const updatedSite = { ...site, sftpUsers };

			return { ...state, [ siteId ]: updatedSite };
		}
		case HOSTING_RECEIVE_SFTP_USER_ERROR: {
			const sftpUsers = { ...site.sftpUsers, [ userId ]: null };
			const updatedSite = { ...site, sftpUsers };

			return { ...state, [ siteId ]: updatedSite };
		}
		case HOSTING_RECEIVE_SFTP_USER: {
			const { sftpUser } = action;
			const sftpUsers = { ...site.sftpUsers, [ userId ]: sftpUser };
			const updatedSite = { ...site, sftpUsers };

			return { ...state, [ siteId ]: updatedSite };
		}
	}

	return state;
};

export default combineReducers( {
	sites,
} );
