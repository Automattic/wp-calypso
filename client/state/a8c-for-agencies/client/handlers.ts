import { AnyAction } from 'redux';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { A4A_GET_CLIENT_REQUEST } from './action-types';
import { receiveClient, receiveClientError } from './actions';
import type { APIError, Client } from '../types';

const formatApiClient = ( client: Client ) => {
	return client;
};

function fetchClientHandler( action: AnyAction ): AnyAction {
	const { clientId, agencyId, ...otherArgs } = action;

	return http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ agencyId }/clients/${ clientId }`,
			// Ignore type checking because TypeScript is incorrectly inferring the prop type due to .js usage in wpcom-http/actions
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			retryPolicy: noRetry(),
		},
		otherArgs
	) as AnyAction;
}

function receiveClientHandler( _action: AnyAction, client: Client ) {
	return receiveClient( client );
}

function receiveClientErrorHandler( _action: AnyAction, error: APIError ) {
	return receiveClientError( error );
}

export default {
	[ A4A_GET_CLIENT_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchClientHandler,
			onSuccess: receiveClientHandler,
			onError: receiveClientErrorHandler,
			fromApi: formatApiClient,
		} ),
	],
};
