/** @format */
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST } from 'client/state/action-types';

export function requestTeams() {
	return {
		type: READER_TEAMS_REQUEST,
	};
}
