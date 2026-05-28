import { getCachedPost } from 'calypso/reader/data/post/cache';
import { getCachedStreamItems } from 'calypso/reader/data/stream';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import { READER_SEEN_MARK_ALL_AS_SEEN_REQUEST } from 'calypso/state/reader/action-types';
import { requestFollows } from 'calypso/state/reader/follows/actions';
import { receiveMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { requestUnseenStatus } from 'calypso/state/reader-ui/seen-posts/actions';
import {
	applyFeedSeenOptimisticUpdate,
	keepFeedSeenOptimisticUpdate,
	rollbackFeedSeenOptimisticUpdate,
} from '../../../feed-cache';

const toApi = ( action ) => {
	return {
		feed_ids: action.feedIds,
		source: action.source,
	};
};

export function fetch( action ) {
	applyFeedSeenOptimisticUpdate( action, {
		feedIds: action.feedIds,
		feedUrls: action.feedUrls,
		reset: true,
	} );

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
export const onSuccess = ( action, response ) => ( dispatch ) => {
	if ( response.status ) {
		keepFeedSeenOptimisticUpdate( action );
		const { identifier, feedIds, feedUrls } = action;
		// re-request unseen status and followed feeds
		dispatch( requestUnseenStatus() );
		dispatch( requestFollows() );

		// get stream post identifier
		const queryClient = getCalypsoQueryClient();
		const globalIds = queryClient
			? getCachedStreamItems( queryClient, { streamKey: identifier } ).reduce( ( acc, item ) => {
					const post = getCachedPost( queryClient, item );
					if ( post?.global_ID ) {
						acc.push( post.global_ID );
					}
					return acc;
			  }, [] )
			: [];

		// update to seen based on global ids
		dispatch( receiveMarkAllAsSeen( { feedIds, feedUrls, globalIds } ) );
	} else {
		rollbackFeedSeenOptimisticUpdate( action );
	}
};

export function onError( action ) {
	// don't do much
	rollbackFeedSeenOptimisticUpdate( action );
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
