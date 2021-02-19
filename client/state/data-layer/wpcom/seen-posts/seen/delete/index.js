/**
 * Internal Dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { receiveMarkAsUnseen } from 'calypso/state/reader/seen-posts/actions';
import { READER_SEEN_MARK_AS_UNSEEN_REQUEST } from 'calypso/state/reader/action-types';
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
			path: `/seen-posts/seen/delete`,
			body: toApi( action ),
		},
		action
	);
}

export const onSuccess = ( action, response ) => ( dispatch ) => {
	if ( response.status ) {
		const { feedId, feedUrl, globalIds } = action;
		// re-request unseen status and followed feeds
		dispatch( requestUnseenStatus() );
		dispatch( requestFollows() );

		dispatch( receiveMarkAsUnseen( { feedId, feedUrl, globalIds } ) );
	}
};

export function onError() {
	// don't do much
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
