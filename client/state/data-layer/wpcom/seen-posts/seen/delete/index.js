import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { READER_SEEN_MARK_AS_UNSEEN_REQUEST } from 'calypso/state/reader/action-types';
import { requestFollows } from 'calypso/state/reader/follows/actions';
import { receiveMarkAsUnseen } from 'calypso/state/reader/seen-posts/actions';
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
		delta: action.globalIds?.length ?? 0,
	} );

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

export const onSuccess = ( action, response ) => ( dispatch ) => {
	if ( response.status ) {
		keepFeedSeenOptimisticUpdate( action );
		const { feedId, feedUrl, globalIds } = action;
		// re-request unseen status and followed feeds
		dispatch( requestUnseenStatus() );
		dispatch( requestFollows() );

		dispatch( receiveMarkAsUnseen( { feedId, feedUrl, globalIds } ) );
	} else {
		rollbackFeedSeenOptimisticUpdate( action );
	}
};

export function onError( action ) {
	// don't do much
	rollbackFeedSeenOptimisticUpdate( action );
	return [];
}

registerHandlers( 'state/data-layer/wpcom/unseen-posts/seen/delete/index.js', {
	[ READER_SEEN_MARK_AS_UNSEEN_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
