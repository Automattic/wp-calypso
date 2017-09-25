/** @format */
/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST, READER_TEAMS_RECEIVE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

export const handleTeamsRequest = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				method: 'GET',
				path: '/read/teams',
				apiVersion: '1.2',
			},
			action
		)
	);
};

export const teamRequestReceived = ( { dispatch }, action, apiResponse ) => {
	dispatch( {
		type: READER_TEAMS_RECEIVE,
		payload: apiResponse,
	} );
};

export const teamRequestFailure = ( { dispatch }, error ) => {
	dispatch( {
		type: READER_TEAMS_RECEIVE,
		payload: error,
		error: true,
	} );
};

export default {
	[ READER_TEAMS_REQUEST ]: [
		dispatchRequest( handleTeamsRequest, teamRequestReceived, teamRequestFailure ),
	],
};
