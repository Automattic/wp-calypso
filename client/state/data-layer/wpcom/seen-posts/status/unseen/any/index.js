/**
 * Internal Dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { receiveUnseenStatusAny } from 'state/ui/reader/seen-posts/actions';
import { READER_UNSEEN_STATUS_ANY_REQUEST } from 'state/action-types';

export function fetch( action ) {
	return http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/seen-posts/status/unseen/any`,
		},
		action
	);
}

export function onSuccess( action, response ) {
	return receiveUnseenStatusAny( { status: response.status } );
}

export function onError() {
	// don't do much
	return [];
}

registerHandlers( 'state/data-layer/wpcom/unseen-posts/status/unseen/any/index.js', {
	[ READER_UNSEEN_STATUS_ANY_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
