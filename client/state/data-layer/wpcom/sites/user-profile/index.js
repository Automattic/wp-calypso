import { USER_PROFILE_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveUserProfile } from 'calypso/state/user-profile/actions';

export const requestFetchUserProfile = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/profile/`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);

export const handleSuccess =
	( { siteId }, response ) =>
	( dispatch ) => {
		return dispatch( receiveUserProfile( siteId, response ) );
	};

export const handleError = () => {
	return null;
};

registerHandlers( 'state/data-layer/wpcom/user-profile/index.js', {
	[ USER_PROFILE_REQUEST ]: [
		dispatchRequest( {
			fetch: requestFetchUserProfile,
			onSuccess: handleSuccess,
			onError: handleError,
		} ),
	],
} );
