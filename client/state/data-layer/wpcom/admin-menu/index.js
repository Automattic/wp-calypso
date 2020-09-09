/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { ADMIN_MENU_FETCH } from 'state/action-types';
// import { receiveLikes } from 'state/posts/likes/actions';

export const fetch = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/admin-menu/`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);

export const fromApi = ( data ) => {
	console.log( data, 'FOO' );
};

export const onSuccess = ( { siteId, postId }, data ) => {
	console.info( 'Successful request!', data );
};

registerHandlers(
	'state/data-layer/wpcom/admin-menu/index.js',
	mergeHandlers( {
		[ ADMIN_MENU_FETCH ]: [
			dispatchRequest( {
				fetch,
				fromApi,
				onSuccess,
				onError: ( error ) => {
					console.warn( 'Error retrieving Menu items', error );
				},
			} ),
		],
	} )
);
