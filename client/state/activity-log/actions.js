/**
 * Internal dependencies
 */
import {
	REWIND_ACTIVATE_FAILURE,
	REWIND_ACTIVATE_REQUEST,
	REWIND_ACTIVATE_SUCCESS,
	REWIND_DEACTIVATE_FAILURE,
	REWIND_DEACTIVATE_REQUEST,
	REWIND_DEACTIVATE_SUCCESS,
	REWIND_RESTORE,
	REWIND_RESTORE_COMPLETED,
	REWIND_STATUS_ERROR,
	REWIND_STATUS_REQUEST,
	REWIND_STATUS_UPDATE,
} from 'state/action-types';

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
		timestamp,
	};
}

export function rewindCompleteRestore( siteId ) {
	return {
		type: REWIND_RESTORE_COMPLETED,
		siteId,
	};
}
