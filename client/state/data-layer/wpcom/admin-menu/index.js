/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { ADMIN_MENU_REQUEST } from 'state/action-types';
import { receiveAdminMenu } from 'state/admin-menu/actions';

export const requestFetchAdminMenu = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/admin-menu/`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);

export const transformAPIData = ( data ) => {
	return data;
};

export const handleSuccess = ( { siteId }, menuData ) => {
	// console.info( 'Successful request!', siteId, postId, data );
	return receiveAdminMenu( siteId, menuData );
};

registerHandlers(
	'state/data-layer/wpcom/admin-menu/index.js',
	mergeHandlers( {
		[ ADMIN_MENU_REQUEST ]: [
			dispatchRequest( {
				fetch: requestFetchAdminMenu,
				fromApi: transformAPIData,
				onSuccess: handleSuccess,
				onError: ( error ) => {
					console.warn( 'Error retrieving Menu items', error );
				},
			} ),
		],
	} )
);
