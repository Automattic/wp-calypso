/** @format */

/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST, READER_TEAMS_RECEIVE } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

export const handleTeamsRequest = action =>
	http(
		{
			method: 'GET',
			path: '/read/teams',
			apiVersion: '1.2',
		},
		action
	);

export const teamRequestReceived = ( action, apiResponse ) => ( {
	type: READER_TEAMS_RECEIVE,
	payload: apiResponse,
} );

export const teamRequestFailure = error => ( {
	type: READER_TEAMS_RECEIVE,
	payload: error,
	error: true,
} );

export default {
	[ READER_TEAMS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: handleTeamsRequest,
			onSuccess: teamRequestReceived,
			onError: teamRequestFailure,
		} ),
	],
};
