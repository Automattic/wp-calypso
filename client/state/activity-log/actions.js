/**
 * Internal dependencies
 */
import {
	REWIND_STATUS_ERROR,
	REWIND_STATUS_REQUEST,
	REWIND_STATUS_UPDATE,
} from 'state/action-types';

export function getRewindStatus( siteId ) {
	return {
		REWIND_STATUS_REQUEST,
		siteId,
	};
}

export function updateRewindStatus( siteId, status ) {
	return {
		type: REWIND_STATUS_UPDATE,
		status,
	};
}

export function rewindStatusError( siteId, error ) {
	return {
		type: REWIND_STATUS_ERROR,
		error,
	};
}
