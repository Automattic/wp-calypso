/** @format */

/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { PLUGINS_FEATURED_REQUEST } from 'state/action-types';

export const fetch = action =>
	http(
		{
			method: 'GET',
			path: '/plugins/featured',
			apiNamespace: 'wpcom/v2',
		},
		action
	);

export const onSuccess = ( action, data ) => {
	console.log( 'SUCCESS', data );
};

export const onError = ( action, data ) => {
	console.log( 'FAIL', data );
};

export default {
	[ PLUGINS_FEATURED_REQUEST ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
};
