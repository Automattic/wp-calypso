/**
 * Internal dependencies
 */
import {
	HOSTING_RESTORE_DATABASE_PASSWORD,
	HOSTING_SFTP_USER_CREATE,
	HOSTING_SFTP_USER_REQUEST,
	HOSTING_SFTP_PASSWORD_RESET,
	HOSTING_SFTP_USER_UPDATE,
} from 'state/action-types';
import 'state/data-layer/wpcom/sites/hosting/restore-database-password';
import 'state/data-layer/wpcom/sites/hosting/sftp-user';

export const restoreDatabasePassword = siteId => ( {
	type: HOSTING_RESTORE_DATABASE_PASSWORD,
	siteId,
} );

export const requestAtomicSftpUser = ( siteId, userId ) => ( {
	type: HOSTING_SFTP_USER_REQUEST,
	siteId,
	userId,
} );

export const updateAtomicSftpUser = ( siteId, userId, sftpUser ) => ( {
	type: HOSTING_SFTP_USER_UPDATE,
	siteId,
	userId,
	sftpUser,
} );

export const createAtomicSftpUser = ( siteId, userId ) => ( {
	type: HOSTING_SFTP_USER_CREATE,
	siteId,
	userId,
} );

export const resetAtomicSftpPassword = ( siteId, userId ) => ( {
	type: HOSTING_SFTP_PASSWORD_RESET,
	siteId,
	userId,
} );
