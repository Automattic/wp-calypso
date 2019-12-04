/**
 * Internal dependencies
 */
import { keyedReducer, combineReducers } from 'state/utils';
import {
	HOSTING_PHP_VERSION_GET_SUCCESS,
	HOSTING_PHP_VERSION_SET,
	HOSTING_PHP_VERSION_SET_FAILURE,
	HOSTING_PHP_VERSION_SET_SUCCESS,
	HOSTING_SFTP_USER_UPDATE,
	HOSTING_SFTP_USERS_SET,
} from 'state/action-types';

const sftpUsers = ( state = {}, { type, users } ) => {
	if ( type === HOSTING_SFTP_USERS_SET ) {
		return users;
	}

	if ( type === HOSTING_SFTP_USER_UPDATE ) {
		return state.map( user => {
			const updatedUser = users.find( u => u.username === user.username );
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
		case HOSTING_PHP_VERSION_SET_SUCCESS:
		case HOSTING_PHP_VERSION_GET_SUCCESS:
			return version;
	}

	return state;
};

const isUpdatingPhpVersion = ( state = false, { type } ) => {
	switch ( type ) {
		case HOSTING_PHP_VERSION_SET:
		case HOSTING_PHP_VERSION_SET_SUCCESS:
		case HOSTING_PHP_VERSION_SET_FAILURE:
			return HOSTING_PHP_VERSION_SET === type;
	}

	return state;
};

const atomicHostingReducer = combineReducers( {
	isUpdatingPhpVersion,
	phpVersion,
	sftpUsers,
} );

export default keyedReducer( 'siteId', atomicHostingReducer );
