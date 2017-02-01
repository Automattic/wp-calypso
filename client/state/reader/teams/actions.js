/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	READER_TEAMS_REQUEST,
	READER_TEAMS_RECEIVE,
} from 'state/action-types';

export function requestTeams() {
	return {
		type: READER_TEAMS_REQUEST,
		meta: {
			requestStart: READER_TEAMS_REQUEST
		}
	};
}

export function receiveTeams( { payload, error } ) {
	return {
		type: READER_TEAMS_RECEIVE,
		payload,
		error: !! error,
		meta: {
			requestEnd: READER_TEAMS_REQUEST,
		}
	};
}

