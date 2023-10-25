import {
	ASYNC_TOAST_DELETE,
	ASYNC_TOAST_DELETE_FAILURE,
	ASYNC_TOAST_DELETE_SUCCESS,
	ASYNC_TOAST_RECEIVE,
	ASYNC_TOAST_REQUEST,
	ASYNC_TOAST_REQUEST_FAILURE,
	ASYNC_TOAST_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import {
	RequestAsyncToastActionType,
	DeleteAsyncToastActionType,
} from 'calypso/state/async-toast/types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const fetchAsyncToast = ( action: RequestAsyncToastActionType ) => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/async-toast`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const deleteAsyncToast = ( action: DeleteAsyncToastActionType ) => {
	return http(
		{
			method: 'DELETE',
			path: `/sites/${ action.siteId }/async-toast/${ action.toastKey }`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

registerHandlers( 'state/data-layer/wpcom/async-toast/index.js', {
	[ ASYNC_TOAST_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchAsyncToast,

			onSuccess: ( action: RequestAsyncToastActionType, response: unknown ) => {
				return [
					{
						type: ASYNC_TOAST_REQUEST_SUCCESS,
						siteId: action.siteId,
					},
					{
						type: ASYNC_TOAST_RECEIVE,
						siteId: action.siteId,
						payload: response,
					},
				];
			},

			onError: ( action: RequestAsyncToastActionType ) => {
				return [
					{
						type: ASYNC_TOAST_REQUEST_FAILURE,
						siteId: action.siteId,
					},
				];
			},
		} ),
	],
	[ ASYNC_TOAST_DELETE ]: [
		dispatchRequest( {
			fetch: deleteAsyncToast,

			onSuccess: ( action: DeleteAsyncToastActionType ) => {
				return [
					{
						type: ASYNC_TOAST_DELETE_SUCCESS,
						siteId: action.siteId,
					},
				];
			},

			onError: ( action: DeleteAsyncToastActionType ) => {
				return [
					{
						type: ASYNC_TOAST_DELETE_FAILURE,
						siteId: action.siteId,
					},
				];
			},
		} ),
	],
} );
