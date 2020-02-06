/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/read/teams';

import 'state/reader/init';

export function requestTeams() {
	return {
		type: READER_TEAMS_REQUEST,
	};
}
