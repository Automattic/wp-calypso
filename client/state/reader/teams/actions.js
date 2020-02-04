/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/read/teams';

import 'state/reader/reducer';

export function requestTeams() {
	return {
		type: READER_TEAMS_REQUEST,
	};
}
