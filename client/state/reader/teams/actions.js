/**
 * External dependencies
 */

/**
 * Internal deps
 */
import wpcom from 'lib/wp';
import {
	READER_TEAMS_REQUEST,
	READER_TEAMS_REQUEST_FAILURE,
	READER_TEAMS_REQUEST_SUCCESS,
} from 'state/action-types';
import { createActionThunk } from 'state/utils';

const wpcomUndocumented = wpcom.undocumented();

export const requestTeams = createActionThunk( {
	requestAction: READER_TEAMS_REQUEST,
	successAction: READER_TEAMS_REQUEST_SUCCESS,
	failureAction: READER_TEAMS_REQUEST_FAILURE,
	dataFetch: () => wpcomUndocumented.readTeams,
} );
