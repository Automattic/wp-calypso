/**
 * Internal Dependencies
 */
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { ADMIN_MENU_REQUEST } from 'calypso/state/action-types';
import { receiveAdminMenu } from 'calypso/state/admin-menu/actions';

export const requestFetchAdminMenu = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/admin-menu/`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);

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
			onSuccess: handleSuccess,
			onError: handleError,
		} ),
	],
} );
