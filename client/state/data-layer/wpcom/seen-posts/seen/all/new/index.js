/**
 * Internal Dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { receiveMarkAllAsSeen } from 'state/reader/seen-posts/actions';
import { READER_SEEN_MARK_ALL_AS_SEEN_REQUEST } from 'state/reader/action-types';
import { getStream } from 'state/reader/streams/selectors';
import { getPostsByKeys } from 'state/reader/posts/selectors';
import { requestUnseenStatus } from 'state/reader-ui/seen-posts/actions';
import { requestFollows } from 'state/reader/follows/actions';

const toApi = ( action ) => {
	return {
		feed_ids: action.feedIds,
		source: action.source,
	};
};

export function fetch( action ) {
	return http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/seen-posts/seen/all/new`,
			body: toApi( action ),
		},
		action
	);
}

// need to dispatch multiple times so use a redux-thunk
export const onSuccess = ( action, response ) => ( dispatch, getState ) => {
	if ( response.status ) {
		const { identifier, feedIds, feedUrls } = action;
		// re-request unseen status and followed feeds
		dispatch( requestUnseenStatus() );
		dispatch( requestFollows() );

		// get stream post identifier
		const state = getState();
		const stream = getStream( state, identifier );

		if ( ! stream.items ) {
			return;
		}
		const posts = getPostsByKeys( state, stream.items );

		// get their global ids
		const globalIds = posts.reduce( ( acc, item ) => {
			acc.push( item.global_ID );
			return acc;
		}, [] );

		// update to seen based on global ids
		dispatch( receiveMarkAllAsSeen( { feedIds, feedUrls, globalIds } ) );
	}
};

export function onError() {
	// don't do much
	return [];
}

registerHandlers( 'state/data-layer/wpcom/seen-posts/seen/all/new/index.js', {
	[ READER_SEEN_MARK_ALL_AS_SEEN_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
