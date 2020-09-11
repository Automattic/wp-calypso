/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { SUPPORT_HISTORY_REQUEST } from 'state/action-types';
import { setSupportHistory } from 'state/help/actions';

const requestSupportHistory = ( action ) => {
	const { email } = action;
	return http(
		{
			method: 'GET',
			path: `/support-history`,
			apiNamespace: 'wpcom/v2',
			query: { email },
		},
		action
	);
};

const receiveSupportHistory = ( action, { data } ) => setSupportHistory( data );

registerHandlers( 'state/data-layer/wpcom/help/support-history/index.js', {
	[ SUPPORT_HISTORY_REQUEST ]: [
		dispatchRequest( {
			fetch: requestSupportHistory,
			onSuccess: receiveSupportHistory,
		} ),
	],
} );
