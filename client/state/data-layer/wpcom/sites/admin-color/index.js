import { ADMIN_COLOR_REQUEST } from 'calypso/state/action-types';
import { receiveAdminColor } from 'calypso/state/admin-color/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

export const requestFetchAdminColor = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/admin-color/`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);

export const handleSuccess =
	( { siteId }, response ) =>
	( dispatch ) => {
		return dispatch( receiveAdminColor( siteId, response.admin_color ) );
	};

export const handleError = () => {
	return null;
};

registerHandlers( 'state/data-layer/wpcom/admin-color/index.js', {
	[ ADMIN_COLOR_REQUEST ]: [
		dispatchRequest( {
			fetch: requestFetchAdminColor,
			onSuccess: handleSuccess,
			onError: handleError,
		} ),
	],
} );
