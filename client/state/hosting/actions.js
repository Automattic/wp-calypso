/**
 * Internal dependencies
 */
import {
	HOSTING_RESTORE_DATABASE_PASSWORD,
	HOSTING_SFTP_USER_CREATE,
	HOSTING_SFTP_USERS_REQUEST,
	HOSTING_SFTP_PASSWORD_RESET,
	HOSTING_SFTP_USER_UPDATE,
	HOSTING_SFTP_USERS_SET,
	HOSTING_PHP_VERSION_REQUEST,
	HOSTING_PHP_VERSION_SET_REQUEST,
	HOSTING_CLEAR_CACHE_REQUEST,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/hosting/restore-database-password';
import 'calypso/state/data-layer/wpcom/sites/hosting/sftp-user';
import 'calypso/state/data-layer/wpcom/sites/hosting/php-version';
import 'calypso/state/data-layer/wpcom/sites/hosting/clear-cache';
import 'calypso/state/hosting/init';

export const restoreDatabasePassword = ( siteId ) => ( {
	type: HOSTING_RESTORE_DATABASE_PASSWORD,
	siteId,
} );

export const requestAtomicSftpUsers = ( siteId ) => ( {
	type: HOSTING_SFTP_USERS_REQUEST,
	siteId,
} );

export const setAtomicSftpUsers = ( siteId, users ) => ( {
	type: HOSTING_SFTP_USERS_SET,
	siteId,
	users,
} );

export const updateAtomicSftpUser = ( siteId, users ) => ( {
	type: HOSTING_SFTP_USER_UPDATE,
	siteId,
	users,
} );

export const createAtomicSftpUser = ( siteId, userId ) => ( {
	type: HOSTING_SFTP_USER_CREATE,
	siteId,
	userId,
} );

export const resetAtomicSftpPassword = ( siteId, sshUsername ) => ( {
	type: HOSTING_SFTP_PASSWORD_RESET,
	siteId,
	sshUsername,
} );

export const updateAtomicPhpVersion = ( siteId, version ) => ( {
	type: HOSTING_PHP_VERSION_SET_REQUEST,
	siteId,
	version,
	meta: {
		dataLayer: {
			trackRequest: true,
			requestKey: `${ HOSTING_PHP_VERSION_SET_REQUEST }-${ siteId }`,
		},
	},
} );

export const clearWordPressCache = ( siteId, reason ) => ( {
	type: HOSTING_CLEAR_CACHE_REQUEST,
	reason,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
			requestKey: `${ HOSTING_CLEAR_CACHE_REQUEST }-${ siteId }`,
		},
	},
} );

export const getAtomicPhpVersion = ( siteId ) => ( {
	type: HOSTING_PHP_VERSION_REQUEST,
	siteId,
} );
