/**
 * Internal dependencies
 */
import { ACTIVITY_LOG_ERROR, ACTIVITY_LOG_REQUEST, ACTIVITY_LOG_UPDATE, REWIND_ACTIVATE_FAILURE, REWIND_ACTIVATE_REQUEST, REWIND_ACTIVATE_SUCCESS, REWIND_DEACTIVATE_FAILURE, REWIND_DEACTIVATE_REQUEST, REWIND_DEACTIVATE_SUCCESS, REWIND_RESTORE, REWIND_RESTORE_DISMISS_PROGRESS, REWIND_RESTORE_PROGRESS_REQUEST, REWIND_RESTORE_UPDATE_ERROR, REWIND_RESTORE_UPDATE_PROGRESS, REWIND_STATUS_ERROR, REWIND_STATUS_REQUEST, REWIND_STATUS_UPDATE } from 'state/action-types';

/**
 * Turn the 'rewind' feature on for a site.
 *
 * @param {String|number} siteId site ID
 * @return {Object} action object
 */
export function activateRewind( siteId ) {
	return {
		type: REWIND_ACTIVATE_REQUEST,
		siteId,
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
 * Activity endpoint query parameters.
 *
 * The API is subject to change, this documentation has been provided as a basis. For up to
 * date information, it's best to check the current state of the API.
 *
 * @typdef {Object} ActivityParams
 *
 * @property {number} dateStart Filter activity after this date (Unix millisecond timestamp).
 * @property {number} dateEnd   Filter activity before this date (Unix millisecond timestamp).
 * @property {number} number    Maximum number of results to return.
 */

/**
 * Requests activity from the API
 *
 * You may optionally pass an object of parameters for the query to this action.
 * @see ActivityParams
 *
 * @param  {number}         siteId site ID
 * @param  {ActivityParams} params Optional. Parameters to pass to the endpoint
 * @return {Object}                The request action
 */
export function activityLogRequest( siteId, params ) {
	return {
		type: ACTIVITY_LOG_REQUEST,
		params,
		siteId,
	};
}

export function activityLogError( siteId, error ) {
	return {
		type: ACTIVITY_LOG_ERROR,
		siteId,
		error,
	};
}

export function activityLogUpdate( siteId, data ) {
	return {
		type: ACTIVITY_LOG_UPDATE,
		siteId,
		data,
	};
}

/**
 * Turn the 'rewind' feature off for a site.
 *
 * @param {String|number} siteId site ID
 * @return {Object} action object
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
 * Fetch the general status of the 'rewind' feature
 * for a site.
 *
 * @param {String|number} siteId site ID
 * @return {Object} action object
 */
export function getRewindStatus( siteId ) {
	return {
		type: REWIND_STATUS_REQUEST,
		siteId,
	};
}

export function updateRewindStatus( siteId, status ) {
	return {
		type: REWIND_STATUS_UPDATE,
		siteId,
		status,
	};
}

export function rewindStatusError( siteId, error ) {
	return {
		type: REWIND_STATUS_ERROR,
		siteId,
		error,
	};
}

/**
 * Restore a site to the given timestamp.
 *
 * @param {String|number} siteId the site ID
 * @param {number} timestamp Unix timestamp to restore site to
 * @return {Object} action object
 */
export function rewindRestore( siteId, timestamp ) {
	return {
		type: REWIND_RESTORE,
		siteId,
		timestamp,
	};
}

export function dismissRewindRestoreProgress( siteId ) {
	return {
		type: REWIND_RESTORE_DISMISS_PROGRESS,
		siteId,
	};
}

export function getRewindRestoreProgress( siteId, timestamp, restoreId ) {
	return {
		type: REWIND_RESTORE_PROGRESS_REQUEST,
		siteId,
		restoreId,
		timestamp,
	};
}

export function updateRewindRestoreProgress( siteId, timestamp, restoreId, progress ) {
	return {
		type: REWIND_RESTORE_UPDATE_PROGRESS,
		...progress,
		freshness: Date.now(),
		restoreId,
		siteId,
		timestamp,
	};
}

export function rewindRestoreUpdateError( siteId, timestamp, error ) {
	return {
		type: REWIND_RESTORE_UPDATE_ERROR,
		siteId,
		timestamp,
		error,
	};
}
