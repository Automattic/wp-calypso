/**
 * Internal dependencies
 */
import { keyedReducer, combineReducers } from 'state/utils';
import {
	HOSTING_PHP_VERSION_SET,
	HOSTING_SFTP_USER_UPDATE,
	HOSTING_SFTP_USERS_SET,
} from 'state/action-types';

export const sftpUsers = ( state = {}, { type, users } ) => {
	if ( type === HOSTING_SFTP_USERS_SET ) {
		return users;
	}

	if ( type === HOSTING_SFTP_USER_UPDATE && Array.isArray( state ) ) {
		return state.map( ( user ) => {
			const updatedUser = users.find( ( u ) => u.username === user.username );
			return {
				...user,
				...updatedUser,
			};
		} );
	}

	return state;
};

const phpVersion = ( state = null, { type, version } ) => {
	switch ( type ) {
		case HOSTING_PHP_VERSION_SET:
			return version;
	}

	return state;
};

const atomicHostingReducer = combineReducers( {
	phpVersion,
	sftpUsers,
} );

export default keyedReducer( 'siteId', atomicHostingReducer );
