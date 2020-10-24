/**
 * Internal Dependencies
 */
import { READER_SEEN_MARK_AS_SEEN_REQUEST } from 'calypso/state/reader/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveMarkAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { requestUnseenStatus } from 'calypso/state/reader-ui/seen-posts/actions';
import { requestFollows } from 'calypso/state/reader/follows/actions';

const toApi = ( action ) => {
	return {
		feed_id: action.feedId,
		feed_item_ids: action.feedItemIds,
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

export const onSuccess = ( action, response ) => ( dispatch ) => {
	const { feedId, feedUrl, globalIds } = action;
	if ( response.status ) {
		// re-request unseen status and followed feeds
		dispatch( requestUnseenStatus() );
		dispatch( requestFollows() );

		dispatch( receiveMarkAsSeen( { feedId, feedUrl, globalIds } ) );
	}
};

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
