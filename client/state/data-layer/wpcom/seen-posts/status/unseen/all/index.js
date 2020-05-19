/**
 * Internal Dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { receiveUnseenStatusAll } from 'state/reader/seen-posts/actions';
import { READER_SEEN_UNSEEN_STATUS_ALL_REQUEST } from 'state/reader/action-types';

export function fetch( action ) {
	return http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: '/seen-posts/status/unseen/all',
			query: { show_subsections: action.showSubsections },
		},
		action
	);
}

export function onSuccess( action, response ) {
	return receiveUnseenStatusAll( { sections: response } );
}

export function onError() {
	// don't do much
	return [];
}

registerHandlers( 'state/data-layer/wpcom/unseen-posts/status/unseen/all/index.js', {
	[ READER_SEEN_UNSEEN_STATUS_ALL_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
