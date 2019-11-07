/**
 * Internal dependencies
 */
import {
	HOSTING_REQUEST_SFTP_USER,
	HOSTING_RECEIVE_SFTP_USER,
	HOSTING_RECEIVE_SFTP_USER_ERROR,
	HOSTING_RESTORE_DATABASE_PASSWORD,
	HOSTING_CREATE_SFTP_USER,
	HOSTING_RESET_SFTP_PASSWORD,
} from 'state/action-types';
import 'state/data-layer/wpcom/sites/hosting/restore-database-password';
import 'state/data-layer/wpcom/sites/hosting/sftp-user';

export const restoreDatabasePassword = siteId => ( {
	type: HOSTING_RESTORE_DATABASE_PASSWORD,
	siteId,
} );

export const requestAtomicSFTPUser = ( siteId, userId ) => ( {
	type: HOSTING_REQUEST_SFTP_USER,
	siteId,
	userId,
} );

export const receiveAtomicSFTPUserError = ( siteId, userId ) => ( {
	type: HOSTING_RECEIVE_SFTP_USER_ERROR,
	siteId,
	userId,
} );

export const receiveAtomicSFTPUser = ( siteId, userId, sftpUser ) => ( {
	type: HOSTING_RECEIVE_SFTP_USER,
	siteId,
	userId,
	sftpUser,
} );

export const createAtomicSFTPUser = ( siteId, userId ) => ( {
	type: HOSTING_CREATE_SFTP_USER,
	siteId,
	userId,
} );

export const resetAtomicSFTPPassword = ( siteId, userId ) => ( {
	type: HOSTING_RESET_SFTP_PASSWORD,
	siteId,
	userId,
} );
