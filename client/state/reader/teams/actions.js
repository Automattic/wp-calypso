/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST } from 'calypso/state/reader/action-types';

import 'calypso/state/data-layer/wpcom/read/teams';

import 'calypso/state/reader/init';

export function requestTeams() {
	return {
		type: READER_TEAMS_REQUEST,
	};
}
