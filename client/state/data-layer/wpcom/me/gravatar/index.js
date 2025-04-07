import { GRAVATAR_DETAILS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveGravatarDetails } from 'calypso/state/gravatar-status/actions';

export const fetchGravatarDetails = ( action ) => {
	return http( {
		method: 'GET',
		path: '/me/gravatar',
		apiNamespace: 'rest/v1',
		query: {
			http_envelope: 1,
		},
		onSuccess: action,
	} );
};

export const onSuccess = ( action, response ) => {
	const data = action?.meta?.dataLayer?.data;

	// Only try to parse if we have non-empty string data
	let gravatarDetails;
	try {
		gravatarDetails =
			data && typeof data === 'string' && data.length > 0 ? JSON.parse( data ) : response; // Fall back to direct response if data parsing fails
	} catch ( e ) {
		gravatarDetails = response; // Use direct response as fallback
	}
	return receiveGravatarDetails( gravatarDetails );
};

registerHandlers( 'state/data-layer/wpcom/me/gravatar/index.js', {
	[ GRAVATAR_DETAILS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchGravatarDetails,
			onSuccess,
			onError: () => {},
		} ),
	],
} );
