import {
	HOSTING_RESTORE_DATABASE_PASSWORD,
	HOSTING_SFTP_USER_CREATE,
	HOSTING_SFTP_USERS_REQUEST,
	HOSTING_SFTP_PASSWORD_RESET,
	HOSTING_SFTP_USER_UPDATE,
	HOSTING_SFTP_USERS_SET,
	HOSTING_SSH_ACCESS_REQUEST,
	HOSTING_SSH_ACCESS_SET,
	HOSTING_SSH_ACCESS_ENABLE,
	HOSTING_SSH_ACCESS_DISABLE,
	HOSTING_SSH_KEYS_REQUEST,
	HOSTING_SSH_KEYS_SET,
	HOSTING_SSH_KEY_ATTACH,
	HOSTING_SSH_KEY_DETACH,
	HOSTING_PHP_VERSION_REQUEST,
	HOSTING_PHP_VERSION_SET_REQUEST,
	HOSTING_CLEAR_CACHE_REQUEST,
	HOSTING_STATIC_FILE_404_REQUEST,
	HOSTING_STATIC_FILE_404_SET_REQUEST,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/hosting/restore-database-password';
import 'calypso/state/data-layer/wpcom/sites/hosting/sftp-user';
import 'calypso/state/data-layer/wpcom/sites/hosting/ssh-access';
import 'calypso/state/data-layer/wpcom/sites/hosting/ssh-key';
import 'calypso/state/data-layer/wpcom/sites/hosting/php-version';
import 'calypso/state/data-layer/wpcom/sites/hosting/static-file-404';
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

export const requestAtomicSshAccess = ( siteId ) => ( {
	type: HOSTING_SSH_ACCESS_REQUEST,
	siteId,
} );

export const setAtomicSshAccess = ( siteId, status ) => ( {
	type: HOSTING_SSH_ACCESS_SET,
	siteId,
	status,
} );

export const enableAtomicSshAccess = ( siteId ) => ( {
	type: HOSTING_SSH_ACCESS_ENABLE,
	siteId,
} );

export const disableAtomicSshAccess = ( siteId ) => ( {
	type: HOSTING_SSH_ACCESS_DISABLE,
	siteId,
} );

export const attachAtomicSshKey = ( siteId, name ) => ( {
	type: HOSTING_SSH_KEY_ATTACH,
	siteId,
	name,
} );

export const detachAtomicSshKey = ( siteId, name ) => ( {
	type: HOSTING_SSH_KEY_DETACH,
	siteId,
	name,
} );

export const requestAtomicSshKeys = ( siteId ) => ( {
	type: HOSTING_SSH_KEYS_REQUEST,
	siteId,
} );

export const setAtomicSshKeys = ( siteId, keys ) => ( {
	type: HOSTING_SSH_KEYS_SET,
	siteId,
	keys,
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

export const updateAtomicStaticFile404 = ( siteId, setting ) => ( {
	type: HOSTING_STATIC_FILE_404_SET_REQUEST,
	siteId,
	setting,
	meta: {
		dataLayer: {
			trackRequest: true,
			requestKey: `${ HOSTING_STATIC_FILE_404_SET_REQUEST }-${ siteId }`,
		},
	},
} );

export const getAtomicStaticFile404 = ( siteId ) => ( {
	type: HOSTING_STATIC_FILE_404_REQUEST,
	siteId,
} );
