/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOWS_SYNC,
	READER_FOLLOWS_SYNC_REQUEST_PAGE,
	READER_FOLLOWS_RECEIVE_PAGE
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';

let isSyncingFollows = false;

// export function handleFollowsRequest( store, action, next ) {
// 	wpcom.req.get( '/read/following/mine', { apiVersion: '1.2' } )
// 		.then(
// 			payload => {
// 				store.dispatch( {
// 					type: READER_FOLLOWS_RECEIVE,
// 					payload,
// 				} );
// 			},
// 			error => {
// 				store.dispatch( {
// 					type: READER_FOLLOWS_RECEIVE,
// 					payload: error,
// 					error: true,
// 				} );
// 			}
// 		);
// 	next( action );
// }

function syncReaderFollows( store ) {
	if ( isSyncingFollows ) {
		return;
	}

	isSyncingFollows = true;

	store.dispatch( {
		type: READER_FOLLOWS_SYNC_REQUEST_PAGE,
		page: 1
	} );
}

function requestPage( store, action ) {
	store.dispatch( http( {
		method: 'GET',
		path: '/read/following/mine',
		apiVersion: 'v1.2',
		query: { page: action.page },
		onSuccess: action,
		onError: action,
	} ) );
}

function handleSyncPage( store, action, next, data ) {
	store.dispatch( {
		type: READER_FOLLOWS_RECEIVE_PAGE,
		payload: data,
	} );

	// Fetch the next page of subscriptions where applicable
	if ( data.number > 0 && data.page <= 40 ) {
		store.dispatch( {
			type: READER_FOLLOWS_SYNC_REQUEST_PAGE,
			page: action.page + 1,
		} );
	} else {
		isSyncingFollows = false;
	}
}

function handleSyncError( store ) {
	isSyncingFollows = false;
	store.dispatch( errorNotice( translate( 'Sorry, we had a problem fetching your Reader subscriptions.' ) ) );
}

export default {
	[ READER_FOLLOWS_SYNC ]: [ syncReaderFollows ],
	[ READER_FOLLOWS_SYNC_REQUEST_PAGE ]: [ dispatchRequest( requestPage, handleSyncPage, handleSyncError ) ],
};
