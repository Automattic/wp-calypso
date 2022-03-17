import { WOO_ADMIN_MENU_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveWooAdminMenu } from 'calypso/state/woo-admin-menu/actions';

export const requestFetchAdminMenu = ( action ) => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/woo-admin-menu/`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

export const handleSuccess = ( { siteId }, menuData ) => ( dispatch ) => {
	return dispatch( receiveWooAdminMenu( siteId, menuData ) );
};

export const handleError = () => {
	return null;
};

registerHandlers( 'state/data-layer/wpcom/woo-admin-menu/index.js', {
	[ WOO_ADMIN_MENU_REQUEST ]: [
		dispatchRequest( {
			fetch: requestFetchAdminMenu,
			onSuccess: handleSuccess,
			onError: handleError,
		} ),
	],
} );
