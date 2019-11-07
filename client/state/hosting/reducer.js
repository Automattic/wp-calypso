/** @format */

/**
 * Internal dependencies
 */

import { combineReducers } from 'state/utils';
import {
	HOSTING_RECEIVE_SFTP_USER,
	HOSTING_REQUEST_SFTP_USER,
	HOSTING_RECEIVE_SFTP_USER_ERROR,
} from 'state/action-types';

const sites = ( state = {}, action ) => {
	switch ( action.type ) {
		case HOSTING_REQUEST_SFTP_USER: {
			const { siteId, userId } = action;
			const site = state[ siteId ] ? state[ siteId ] : {};
			const sftpUsers = { ...site.sftpUsers, [ userId ]: { loading: true } };
			const updatedSite = { ...site, sftpUsers };

			return { ...state, [ siteId ]: updatedSite };
		}
		case HOSTING_RECEIVE_SFTP_USER_ERROR: {
			const { siteId, userId } = action;
			const site = state[ siteId ] ? state[ siteId ] : {};
			const sftpUsers = { ...site.sftpUsers, [ userId ]: null };
			const updatedSite = { ...site, sftpUsers };

			return { ...state, [ siteId ]: updatedSite };
		}
		case HOSTING_RECEIVE_SFTP_USER: {
			const { siteId, userId, sftpUser } = action;
			const site = state[ siteId ] ? state[ siteId ] : {};
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
