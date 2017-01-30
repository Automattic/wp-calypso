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
			requestKey: READER_TEAMS_REQUEST
		}
	};
}

export function receiveTeams( payload, isError ) {
	return {
		type: READER_TEAMS_RECEIVE,
		payload,
		error: !! isError,
		meta: {
			requestKey: READER_TEAMS_REQUEST,
			requestEnded: true,
		}
	};
}

