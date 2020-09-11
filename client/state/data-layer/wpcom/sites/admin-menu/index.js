/**
 * Internal Dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { ADMIN_MENU_REQUEST } from 'state/action-types';
import { receiveAdminMenu } from 'state/admin-menu/actions';

export const requestFetchAdminMenu = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/admin-menu/`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);

export const transformAPIData = ( data ) => {
	return data;
};

export const handleSuccess = ( { siteId }, menuData ) => {
	return receiveAdminMenu( siteId, menuData );
};

export const handleError = () => {
	return null;
};

registerHandlers( 'state/data-layer/wpcom/admin-menu/index.js', {
	[ ADMIN_MENU_REQUEST ]: [
		dispatchRequest( {
			fetch: requestFetchAdminMenu,
			fromApi: transformAPIData,
			onSuccess: handleSuccess,
			onError: handleError,
		} ),
	],
} );
