/**
 * Internal Dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { receiveMarkAllAsUnseen, requestUnseenStatusAll } from 'state/reader/seen-posts/actions';
import { READER_SEEN_MARK_ALL_AS_UNSEEN_REQUEST } from 'state/reader/action-types';
import { getStream } from 'state/reader/streams/selectors';
import { getPostsByKeys } from 'state/reader/posts/selectors';

const toApi = ( action ) => {
	return {
		section: action.section,
	};
};

export function fetch( action ) {
	return http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/seen-posts/seen/all/delete`,
			body: toApi( action ),
		},
		action
	);
}

// need to dispatch multiple times so use a redux-thunk
export const onSuccess = ( action, response ) => ( dispatch, getState ) => {
	if ( response.status ) {
		// get stream post identifier
		const state = getState();
		const section = getStream( state, action.section );

		if ( ! section.items ) {
			return;
		}
		const posts = getPostsByKeys( state, section.items );

		// get their global ids
		const globalIds = posts.reduce( ( acc, item ) => {
			acc.push( item.global_ID );
			return acc;
		}, [] );

		// update to seen based on global ids
		dispatch( receiveMarkAllAsUnseen( { section: action.section, globalIds } ) );
	}

	// re-request unseen statuses
	dispatch( requestUnseenStatusAll() );
};

export function onError() {
	// don't do much
	return [];
}

registerHandlers( 'state/data-layer/wpcom/seen-posts/seen/all/delete/index.js', {
	[ READER_SEEN_MARK_ALL_AS_UNSEEN_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );
