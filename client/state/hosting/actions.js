import {
	HOSTING_RESTORE_DATABASE_PASSWORD,
	HOSTING_GEO_AFFINITY_REQUEST,
	HOSTING_SFTP_USER_CREATE,
	HOSTING_SFTP_USERS_REQUEST,
	HOSTING_SFTP_PASSWORD_RESET,
	HOSTING_SFTP_USER_UPDATE,
	HOSTING_SFTP_USERS_SET,
	HOSTING_SSH_ACCESS_REQUEST,
	HOSTING_SSH_ACCESS_SET,
	HOSTING_SSH_ACCESS_ENABLE,
	HOSTING_SSH_ACCESS_DISABLE,
	HOSTING_PHP_VERSION_REQUEST,
	HOSTING_PHP_VERSION_SET_REQUEST,
	HOSTING_CLEAR_CACHE_REQUEST,
	HOSTING_STATIC_FILE_404_REQUEST,
	HOSTING_STATIC_FILE_404_SET_REQUEST,
	HOSTING_WP_VERSION_REQUEST,
	HOSTING_WP_VERSION_SET_REQUEST,
	HOSTING_CLEAR_EDGE_CACHE_SUCCESS,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/hosting/restore-database-password';
import 'calypso/state/data-layer/wpcom/sites/hosting/geo-affinity';
import 'calypso/state/data-layer/wpcom/sites/hosting/sftp-user';
import 'calypso/state/data-layer/wpcom/sites/hosting/ssh-access';
import 'calypso/state/data-layer/wpcom/sites/hosting/php-version';
import 'calypso/state/data-layer/wpcom/sites/hosting/static-file-404';
import 'calypso/state/data-layer/wpcom/sites/hosting/wp-version';
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

export const clearEdgeCacheSuccess = ( siteId ) => ( {
	type: HOSTING_CLEAR_EDGE_CACHE_SUCCESS,
	siteId,
} );

export const getAtomicGeoAffinity = ( siteId ) => ( {
	type: HOSTING_GEO_AFFINITY_REQUEST,
	siteId,
} );

export const getAtomicPhpVersion = ( siteId ) => ( {
	type: HOSTING_PHP_VERSION_REQUEST,
	siteId,
} );

export const getAtomicWpVersion = ( siteId ) => ( {
	type: HOSTING_WP_VERSION_REQUEST,
	siteId,
} );

export const updateAtomicWpVersion = ( siteId, version ) => ( {
	type: HOSTING_WP_VERSION_SET_REQUEST,
	siteId,
	version,
	meta: {
		dataLayer: {
			trackRequest: true,
			requestKey: `${ HOSTING_WP_VERSION_SET_REQUEST }-${ siteId }`,
		},
	},
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
