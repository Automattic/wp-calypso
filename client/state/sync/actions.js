import {
	SITE_SYNC_STATUS_REQUEST,
	SITE_SYNC_STATUS_REQUEST_FAILURE,
	SITE_SYNC_STATUS_SET,
	SITE_SYNC_IS_SYNCING_IN_PROGRESS,
	SITE_SYNC_SITE_TYPE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/sync/status';

import 'calypso/state/sync/init';

/**
 * Query the sync status of a given site.
 * @param {number} siteId The id of the site to query.
 * @returns {Object} An action object
 */
export const fetchSyncStatus = ( siteId ) => ( {
	type: SITE_SYNC_STATUS_REQUEST,
	siteId,
} );

/**
 * Sets the status of sync for a particular site.
 * @see state/sync/constants#SiteSyncStatus
 * @param {number} siteId The site id to which the status belongs
 * @param {string | null } status The new status of the automated transfer
 * @returns {Object} An action object
 */
export const setSiteSyncStatus = ( siteId, status ) => ( {
	type: SITE_SYNC_STATUS_SET,
	siteId,
	status,
} );

/**
 * Sets the site that is synced.
 * @param {number} siteId The site id to which the status belongs
 * @param { string | null } siteType of the sync
 * @returns {Object} An action object
 */
export const setSyncingSiteType = ( siteId, siteType ) => ( {
	type: SITE_SYNC_SITE_TYPE,
	siteId,
	siteType,
} );

/**
 * Sets the sync in progress status for a particular site.
 * @param {number} siteId The site id to which the status belongs
 * @param { boolean } isSyncingInProgress Whether the site is syncing
 * @returns {Object} An action object
 */
export const setSyncInProgress = ( siteId, isSyncingInProgress ) => ( {
	type: SITE_SYNC_IS_SYNCING_IN_PROGRESS,
	siteId,
	isSyncingInProgress,
} );

/**
 * Report a failure of fetching site sync status (for example, the status
 * endpoint returns 404).
 * @param {Object} param failure details
 * @param {number} param.siteId The site id to which the status belongs
 * @param {string} param.error The error string received
 * @returns {Object} An action object
 */
export const siteSyncStatusFetchingFailure = ( { siteId, error } ) => ( {
	type: SITE_SYNC_STATUS_REQUEST_FAILURE,
	siteId,
	error,
} );
