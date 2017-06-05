/**
 * Internal dependencies
 */
import {
	REWIND_ACTIVATE_FAILURE,
	REWIND_ACTIVATE_REQUEST,
	REWIND_ACTIVATE_SUCCESS,
	REWIND_STATUS_ERROR,
	REWIND_STATUS_REQUEST,
	REWIND_STATUS_UPDATE,
} from 'state/action-types';

export function activateRewind( siteId ) {
	return {
		REWIND_ACTIVATE_REQUEST,
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

export function getRewindStatus( siteId ) {
	return {
		REWIND_STATUS_REQUEST,
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
