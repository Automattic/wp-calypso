/**
 * External dependencies
 */

/**
 * Internal deps
 */
import wpcom from 'lib/wp';
import {
	READER_TEAMS_REQUEST,
	READER_DATA_REQUEST,
} from 'state/action-types';

const wpcomUndocumented = wpcom.undocumented();

export function requestTeams() {
	return {
		type: READER_DATA_REQUEST,
		requestAction: READER_TEAMS_REQUEST,
		dataFetch: wpcomUndocumented.readTeams,
	};
}
