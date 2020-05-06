/**
 * Internal Dependencies
 */
import { READER_SEEN_MARK_AS_SEEN_REQUEST } from 'state/reader/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { receiveMarkAsSeen } from 'state/reader/seen-posts/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

const toApi = ( action ) => {
	return {
		blog_id: action.blogId,
		post_id: action.postId,
		source: action.source,
	};
};

export function fetch( action ) {
	return http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/seen-posts/seen/new`,
			body: toApi( action ),
		},
		action
	);
}

export function onSuccess( action, response ) {
	if ( response.status ) {
		return receiveMarkAsSeen( {
			blogId: action.blogId,
			postId: action.postId,
			globalId: action.globalId,
		} );
	}
}

export function onError() {
	// don't do much
	return [];
}

registerHandlers( 'state/data-layer/wpcom/seen-posts/seen/new/index.js', {
	[ READER_SEEN_MARK_AS_SEEN_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
