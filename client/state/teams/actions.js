/**
 * Internal dependencies
 */
import { TEAMS_REQUEST } from 'calypso/state/teams/action-types';

import 'calypso/state/data-layer/wpcom/read/teams';

import 'calypso/state/teams/init';

export function requestTeams() {
	return {
		type: TEAMS_REQUEST,
	};
}
