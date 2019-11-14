/**
 * Internal dependencies
 */

import { keyedReducer, combineReducers } from 'state/utils';
import { HOSTING_SFTP_USER_UPDATE } from 'state/action-types';

const sftpUsers = ( state = {}, { type, userId, sftpUser } ) => {
	return type === HOSTING_SFTP_USER_UPDATE ? { ...sftpUsers, [ userId ]: sftpUser } : state;
};

const atomicHostingReducer = combineReducers( {
	sftpUsers,
} );

export default keyedReducer( 'siteId', atomicHostingReducer );
