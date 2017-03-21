/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOWS_SYNC_START,
	READER_FOLLOWS_SYNC_REQUEST_PAGE,
	READER_FOLLOWS_RECEIVE_PAGE
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';

const requestPageAction = page => ( {
	type: READER_FOLLOWS_SYNC_REQUEST_PAGE,
	payload: { page }
} );

let isSyncingFollows = false;
function syncReaderFollows( store, action, next ) {
	if ( isSyncingFollows ) {
		return;
	}

	isSyncingFollows = true;

	store.dispatch( requestPageAction( 1 ) );

	next( action );
}

function requestPage( store, action ) {
	store.dispatch( http( {
		method: 'GET',
		path: '/read/following/mine',
		apiVersion: 'v1.2',
		query: { page: action.payload.page },
		onSuccess: action,
		onError: action,
	} ) );
}

const MAX_PAGES_TO_FETCH = 40; // TODO what should be the number here?
function receivePage( store, action, next, data ) {
	store.dispatch( {
		type: READER_FOLLOWS_RECEIVE_PAGE,
		payload: data, // TODO fromApi + validation + error etc.
	} );
	console.error( data );

	// Fetch the next page of subscriptions where applicable
	if ( data.number > 0 && data.page <= MAX_PAGES_TO_FETCH ) {
		store.dispatch( requestPage( data.page + 1 ) );
		return;
	}
	isSyncingFollows = false;
}

function receiveError( store ) {
	isSyncingFollows = false;
	store.dispatch(
		errorNotice( translate( 'Sorry, we had a problem fetching your Reader subscriptions.' ) )
	);
}

export default {
	[ READER_FOLLOWS_SYNC_START ]: [ syncReaderFollows ],
	[ READER_FOLLOWS_SYNC_REQUEST_PAGE ]: [ dispatchRequest( requestPage, receivePage, receiveError ) ],
};
