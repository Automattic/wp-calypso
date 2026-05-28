import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { READER_SEEN_MARK_AS_SEEN_REQUEST } from 'calypso/state/reader/action-types';
import { requestFollows } from 'calypso/state/reader/follows/actions';
import { receiveMarkAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { requestUnseenStatus } from 'calypso/state/reader-ui/seen-posts/actions';
import {
	applyFeedSeenOptimisticUpdate,
	keepFeedSeenOptimisticUpdate,
	rollbackFeedSeenOptimisticUpdate,
} from '../../feed-cache';

const toApi = ( action ) => {
	return {
		feed_id: action.feedId,
		feed_item_ids: action.feedItemIds,
		source: action.source,
	};
};

export function fetch( action ) {
	applyFeedSeenOptimisticUpdate( action, {
		feedIds: [ action.feedId ],
		feedUrls: [ action.feedUrl ],
		delta: -( action.globalIds?.length ?? 0 ),
	} );

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

export const onSuccess = ( action, response ) => ( dispatch ) => {
	const { feedId, feedUrl, globalIds } = action;
	if ( response.status ) {
		keepFeedSeenOptimisticUpdate( action );
		// re-request unseen status and followed feeds
		dispatch( requestUnseenStatus() );
		dispatch( requestFollows() );

		dispatch( receiveMarkAsSeen( { feedId, feedUrl, globalIds } ) );
	} else {
		rollbackFeedSeenOptimisticUpdate( action );
	}
};

export function onError( action ) {
	// don't do much
	rollbackFeedSeenOptimisticUpdate( action );
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
