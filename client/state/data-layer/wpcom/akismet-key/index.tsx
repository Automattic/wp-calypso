import {
	AKISMET_KEY_REQUEST,
	AKISMET_KEY_RECIEVE,
	AKISMET_KEY_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const fetchAkismetAPIKey = ( action: object ) => {
	return http(
		{
			method: 'GET',
			path: `/akismet/get-key`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const onFetchSuccess = ( action: object, response: object ) => {
	return [
		{
			type: AKISMET_KEY_RECIEVE,
			key: response,
		},
	];
};

const onFetchError = ( action: object, error: unknown ) => {
	return [
		{
			type: AKISMET_KEY_REQUEST_FAILURE,
			error,
		},
	];
};

registerHandlers( 'state/data-layer/wpcom/akismet-key/index.js', {
	[ AKISMET_KEY_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchAkismetAPIKey,
			onSuccess: onFetchSuccess,
			onError: onFetchError,
		} ),
	],
} );
