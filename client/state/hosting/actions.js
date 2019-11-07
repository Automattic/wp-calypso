/**
 * Internal dependencies
 */
import {
	HOSTING_REQUEST_SFTP_USER,
	HOSTING_RECEIVE_SFTP_USER,
	HOSTING_RECEIVE_SFTP_USER_ERROR,
	HOSTING_RESTORE_DATABASE_PASSWORD,
} from 'state/action-types';
import 'state/data-layer/wpcom/sites/hosting/restore-database-password';
import 'state/data-layer/wpcom/sites/hosting/sftp-user';

export const restoreDatabasePassword = siteId => ( {
	type: HOSTING_RESTORE_DATABASE_PASSWORD,
	siteId,
} );

export const requestSFTPUser = ( siteId, userId ) => ( {
	type: HOSTING_REQUEST_SFTP_USER,
	siteId,
	userId,
} );

export const receiveSFTPUserError = ( siteId, userId ) => ( {
	type: HOSTING_RECEIVE_SFTP_USER_ERROR,
	siteId,
	userId,
} );

export const receiveSFTPUser = ( siteId, userId, sftpUser ) => ( {
	type: HOSTING_RECEIVE_SFTP_USER,
	siteId,
	userId,
	sftpUser,
} );
