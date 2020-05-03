/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST, READER_TEAMS_RECEIVE } from 'state/reader/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const handleTeamsRequest = ( action ) =>
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

export const teamRequestFailure = ( error ) => ( {
	type: READER_TEAMS_RECEIVE,
	payload: error,
	error: true,
} );

registerHandlers( 'state/data-layer/wpcom/read/teams/index.js', {
	[ READER_TEAMS_REQUEST ]: [
		dispatchRequest( {
			fetch: handleTeamsRequest,
			onSuccess: teamRequestReceived,
			onError: teamRequestFailure,
		} ),
	],
} );
