/**
 * Internal Dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { receiveMarkAsUnseen } from 'state/reader/seen-posts/actions';
import { READER_SEEN_MARK_AS_UNSEEN_REQUEST } from 'state/reader/action-types';

const toApi = ( action ) => {
	return {
		blog_id: action.blogId,
		post_id: action.postId,
	};
};

export function fetch( action ) {
	return http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/seen-posts/seen/delete`,
			body: toApi( action ),
		},
		action
	);
}

export function onSuccess( action, response ) {
	if ( response.status ) {
		return receiveMarkAsUnseen( {
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

registerHandlers( 'state/data-layer/wpcom/seen-posts/unseen/new/index.js', {
	[ READER_SEEN_MARK_AS_UNSEEN_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
