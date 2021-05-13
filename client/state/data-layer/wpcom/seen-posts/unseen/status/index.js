/**
 * Internal Dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { receiveUnseenStatus } from 'calypso/state/reader-ui/seen-posts/actions';
import { READER_UNSEEN_STATUS_REQUEST } from 'calypso/state/action-types';

export function fetch( action ) {
	return http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/seen-posts/unseen/status`,
		},
		action
	);
}

export function onSuccess( action, response ) {
	return receiveUnseenStatus( { status: response.status } );
}

export function onError() {
	// don't do much
	return [];
}

registerHandlers( 'state/data-layer/wpcom/unseen-posts/unseen/status/index.js', {
	[ READER_UNSEEN_STATUS_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
