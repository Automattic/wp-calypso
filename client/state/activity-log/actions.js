import page from 'page';
import { addQueryArgs } from 'calypso/lib/url';
import {
	ACTIVITY_LOG_FILTER_SET,
	ACTIVITY_LOG_FILTER_UPDATE,
	REWIND_ACTIVATE_FAILURE,
	REWIND_ACTIVATE_REQUEST,
	REWIND_ACTIVATE_SUCCESS,
	REWIND_ACTIVITY_SHARE_REQUEST,
	REWIND_CLONE,
	REWIND_DEACTIVATE_FAILURE,
	REWIND_DEACTIVATE_REQUEST,
	REWIND_DEACTIVATE_SUCCESS,
	REWIND_RESTORE,
	REWIND_RESTORE_DISMISS,
	REWIND_RESTORE_DISMISS_PROGRESS,
	REWIND_RESTORE_PROGRESS_REQUEST,
	REWIND_RESTORE_REQUEST,
	REWIND_RESTORE_UPDATE_PROGRESS,
	REWIND_BACKUP,
	REWIND_BACKUP_REQUEST,
	REWIND_BACKUP_DISMISS,
	REWIND_BACKUP_PROGRESS_REQUEST,
	REWIND_BACKUP_SITE,
	REWIND_BACKUP_UPDATE_ERROR,
	REWIND_BACKUP_UPDATE_PROGRESS,
	REWIND_BACKUP_DISMISS_PROGRESS,
} from 'calypso/state/action-types';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import { filterStateToQuery } from './utils';

import 'calypso/state/data-layer/wpcom/activity-log/activate';
import 'calypso/state/data-layer/wpcom/activity-log/deactivate';
import 'calypso/state/data-layer/wpcom/activity-log/rewind/backup';
import 'calypso/state/data-layer/wpcom/activity-log/rewind/downloads';
import 'calypso/state/data-layer/wpcom/activity-log/rewind/restore-status';
import 'calypso/state/data-layer/wpcom/activity-log/rewind/to';
import 'calypso/state/data-layer/wpcom/activity-log/share';
import 'calypso/state/data-layer/wpcom/sites/rewind/downloads';
import 'calypso/state/data-layer/wpcom/sites/rewind/restores';
import 'calypso/state/activity-log/init';

/**
 * Turn the 'rewind' feature on for a site.
 *
 * @param  {string|number} siteId      Site ID
 * @param  {boolean}          isVpMigrate Whether this is a VaultPress migration.
 * @returns {Object}        Action object
 */
export function activateRewind( siteId, isVpMigrate ) {
	return {
		type: REWIND_ACTIVATE_REQUEST,
		siteId,
		isVpMigrate,
	};
}

export function rewindActivateSuccess( siteId ) {
	return {
		type: REWIND_ACTIVATE_SUCCESS,
		siteId,
	};
}

export function rewindActivateFailure( siteId ) {
	return {
		type: REWIND_ACTIVATE_FAILURE,
		siteId,
	};
}

/**
 * Share a rewind/activity-log event via email.
 *
 * @param {string|number} siteId Site ID
 * @param {string|number} rewindId Activity ID
 * @param {string} email Email address to send to
 * @returns {Object} action object
 */
export function rewindShareRequest( siteId, rewindId, email ) {
	return {
		type: REWIND_ACTIVITY_SHARE_REQUEST,
		siteId,
		rewindId,
		email,
	};
}

/**
 * Turn the 'rewind' feature off for a site.
 *
 * @param {string|number} siteId site ID
 * @returns {Object} action object
 */
export function deactivateRewind( siteId ) {
	return {
		type: REWIND_DEACTIVATE_REQUEST,
		siteId,
	};
}

export function rewindDeactivateSuccess( siteId ) {
	return {
		type: REWIND_DEACTIVATE_SUCCESS,
		siteId,
	};
}

export function rewindDeactivateFailure( siteId ) {
	return {
		type: REWIND_DEACTIVATE_FAILURE,
		siteId,
	};
}

/**
 * Request a restore to a specific Activity.
 *
 * @param  {string|number} siteId Site ID
 * @param  {number}        activityId Activity ID
 * @returns {Object}        action object
 */
export function rewindRequestRestore( siteId, activityId ) {
	return {
		type: REWIND_RESTORE_REQUEST,
		siteId,
		activityId,
	};
}

/**
 * Dismiss a restore request.
 *
 * @param  {string|number} siteId Site ID
 * @returns {Object}        action object
 */
export function rewindRequestDismiss( siteId ) {
	return {
		type: REWIND_RESTORE_DISMISS,
		siteId,
	};
}

/**
 * Restore a site to the given timestamp.
 *
 * @param {string|number} siteId the site ID
 * @param {string|number} timestamp Unix timestamp to restore site to
 * @param {Object} args Additional request params, such as `types`
 * @returns {Object} action object
 */
export function rewindRestore( siteId, timestamp, args ) {
	return {
		type: REWIND_RESTORE,
		siteId,
		timestamp,
		args,
	};
}

export function rewindClone( siteId, timestamp, payload ) {
	return {
		type: REWIND_CLONE,
		siteId,
		timestamp,
		payload,
	};
}

export function dismissRewindRestoreProgress( siteId, restoreId ) {
	return {
		type: REWIND_RESTORE_DISMISS_PROGRESS,
		siteId,
		restoreId,
	};
}

export function getRewindRestoreProgress( siteId, restoreId ) {
	return {
		type: REWIND_RESTORE_PROGRESS_REQUEST,
		siteId,
		restoreId,
	};
}

export function updateRewindRestoreProgress( siteId, timestamp, restoreId, progress ) {
	return {
		type: REWIND_RESTORE_UPDATE_PROGRESS,
		...progress,
		restoreId,
		siteId,
		timestamp,
	};
}

/**
 * Request a backup up to a specific Activity.
 *
 * @param  {string|number} siteId Site ID
 * @param  {number}        rewindId Rewind ID
 * @returns {Object}        action object
 */
export function rewindRequestBackup( siteId, rewindId ) {
	return {
		type: REWIND_BACKUP_REQUEST,
		siteId,
		rewindId,
	};
}

/**
 * Dismiss a backup request.
 *
 * @param  {string|number} siteId Site ID
 * @returns {Object}        action object
 */
export function rewindBackupDismiss( siteId ) {
	return {
		type: REWIND_BACKUP_DISMISS,
		siteId,
	};
}

/**
 * Create a backup of the site up the given rewind id.
 *
 * @param  {string|number} siteId   The site ID
 * @param  {string|number} rewindId Id of activity up to the one the backup will be created.
 * @param  {Object}        args     Additional request params, such as `types`
 * @returns {Object}                 Action object
 */
export function rewindBackup( siteId, rewindId, args ) {
	return {
		type: REWIND_BACKUP,
		siteId,
		rewindId,
		args,
	};
}

/**
 * Check progress of backup creation for the a given download id.
 *
 * @param  {string|number} siteId The site ID
 * @returns {Object}               Action object
 */
export function getRewindBackupProgress( siteId ) {
	return {
		type: REWIND_BACKUP_PROGRESS_REQUEST,
		siteId,
		meta: {
			dataLayer: {
				trackRequest: true,
			},
		},
	};
}

/**
 * Update the status of the backup creation with its progress.
 *
 * @param  {string|number} siteId     The site ID
 * @param  {?number}        downloadId Id of the backup being created.
 * @param  {?number}        progress   Number from 0 to 100 that indicates the progress of the backup creation.
 * @returns {Object}                   Action object
 */
export function updateRewindBackupProgress( siteId, downloadId, progress ) {
	return {
		type: REWIND_BACKUP_UPDATE_PROGRESS,
		...progress,
		downloadId,
		siteId,
	};
}

/**
 * Update the status of the backup creation when it errors.
 *
 * @param  {string|number} siteId     The site ID
 * @param  {number}        downloadId Id of the backup being created.
 * @param  {Object}        error      Info about downloadable backup and error.
 * @returns {Object}                   Action object
 */
export function rewindBackupUpdateError( siteId, downloadId, error ) {
	return {
		type: REWIND_BACKUP_UPDATE_ERROR,
		siteId,
		downloadId,
		...error,
	};
}

/**
 * Remove success banner.
 *
 * @param  {string|number} siteId     The site ID
 * @param  {number}        downloadId Id of the backup being dismissed.
 * @returns {Object}                   Action object
 */
export function dismissRewindBackupProgress( siteId, downloadId ) {
	return {
		type: REWIND_BACKUP_DISMISS_PROGRESS,
		siteId,
		downloadId,
	};
}

/**
 * Enqueue a new backup of a site
 *
 * @param  {string|number} siteId   The site ID
 * @returns {Object}                 Action object
 */
export function rewindBackupSite( siteId ) {
	return {
		type: REWIND_BACKUP_SITE,
		siteId,
	};
}

function navigateToFilter( filter ) {
	const { pathname, hash } = window.location;

	if ( ! pathname.startsWith( '/activity-log/' ) && ! pathname.startsWith( '/backup/activity/' ) ) {
		return;
	}

	page( addQueryArgs( filterStateToQuery( filter ), pathname + hash ) );
}

export const setFilter =
	( siteId, filter, skipUrlUpdate = false ) =>
	( dispatch, getState ) => {
		dispatch( { type: ACTIVITY_LOG_FILTER_SET, siteId, filter } );
		if ( ! skipUrlUpdate ) {
			navigateToFilter( getActivityLogFilter( getState(), siteId ) );
		}
	};

export const updateFilter =
	( siteId, filter, skipUrlUpdate = false ) =>
	( dispatch, getState ) => {
		dispatch( { type: ACTIVITY_LOG_FILTER_UPDATE, siteId, filter } );
		if ( ! skipUrlUpdate ) {
			navigateToFilter( getActivityLogFilter( getState(), siteId ) );
		}
	};
