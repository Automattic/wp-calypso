import { AnyAction } from 'redux';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { APIError, Agency } from '../types';
import { JETPACK_GET_AGENCIES_REQUEST } from './action-types';
import { receiveAgencies, receiveAgenciesError } from './actions';

const formatApiAgencies = ( agencies: Agency[] ) => {
	return agencies;
};

function fetchAgenciesHandler( action: AnyAction ): AnyAction {
	return http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/agency',
			// Ignore type checking because TypeScript is incorrectly inferring the prop type due to .js usage in wpcom-http/actions
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			retryPolicy: noRetry(),
		},
		action
	) as AnyAction;
}

function receiveAgenciesHandler( _action: AnyAction, agencies: Agency[] ) {
	return receiveAgencies( agencies );
}

function receiveAgenciesErrorHandler( _action: AnyAction, error: APIError ) {
	return receiveAgenciesError( error );
}

export default {
	[ JETPACK_GET_AGENCIES_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchAgenciesHandler,
			onSuccess: receiveAgenciesHandler,
			onError: receiveAgenciesErrorHandler,
			fromApi: formatApiAgencies,
		} ),
	],
};
