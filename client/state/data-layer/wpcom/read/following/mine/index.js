/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_FOLLOWS_SYNC_START,
	READER_FOLLOWS_SYNC_PAGE,
} from 'state/reader/action-types';
import { receiveFollows, syncComplete } from 'state/reader/follows/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { isValidApiResponse, subscriptionsFromApi } from './utils';

import { registerHandlers } from 'state/data-layer/handler-registry';

const ITEMS_PER_PAGE = 200;
const MAX_ITEMS = 2000;

export const syncReaderFollowsPage = ( page = 1, number = ITEMS_PER_PAGE, meta = '' ) => ( {
	type: READER_FOLLOWS_SYNC_PAGE,
	payload: { page, meta, number },
} );

let syncingFollows = false;
let seenSubscriptions = null;

export const isSyncingFollows = () => syncingFollows;
export const resetSyncingFollows = () => ( syncingFollows = false );

export function syncReaderFollows( store ) {
	if ( isSyncingFollows() ) {
		return;
	}

	syncingFollows = true;
	seenSubscriptions = new Set();

	store.dispatch( syncReaderFollowsPage( 1 ) );
}

export function requestPage( action ) {
	const { page, number, meta } = action.payload;

	return http(
		{
			method: 'GET',
			path: '/read/following/mine',
			apiVersion: '1.2',
			query: { page, number, meta },
		},
		action
	);
}

const MAX_PAGES_TO_FETCH = MAX_ITEMS / ITEMS_PER_PAGE;

export const receivePage = ( action, apiResponse ) => ( dispatch ) => {
	if ( ! isValidApiResponse( apiResponse ) ) {
		dispatch( receiveError() );
		return;
	}

	const { page, number } = apiResponse;
	const follows = subscriptionsFromApi( apiResponse );
	let totalCount = null;

	// Only trust the total count if we're on the first page of results,
	// or on subsequent pages where we have more than one follow returned
	if ( page === 1 || number > 0 ) {
		totalCount = apiResponse.total_subscriptions;
	}

	dispatch( receiveFollows( { follows, totalCount } ) );

	forEach( follows, ( follow ) => seenSubscriptions.add( follow.feed_URL ) );

	// Fetch the next page of subscriptions where applicable
	if ( number > 0 && page <= MAX_PAGES_TO_FETCH && isSyncingFollows() ) {
		dispatch( syncReaderFollowsPage( page + 1 ) );
		return;
	}

	// all done syncing
	dispatch( syncComplete( Array.from( seenSubscriptions ) ) );

	seenSubscriptions = null;
	syncingFollows = false;
};

export function receiveError() {
	syncingFollows = false;
	return errorNotice( translate( 'Sorry, we had a problem fetching your Reader subscriptions.' ) );
}

const syncPage = dispatchRequest( {
	fetch: requestPage,
	onSuccess: receivePage,
	onError: receiveError,
} );

export function updateSeenOnFollow( store, action ) {
	if ( seenSubscriptions ) {
		seenSubscriptions.add( action.payload.feedUrl );
	}
}

registerHandlers( 'state/data-layer/wpcom/read/following/mine/index.js', {
	[ READER_FOLLOWS_SYNC_START ]: [ syncReaderFollows ],
	[ READER_FOLLOWS_SYNC_PAGE ]: [ syncPage ],
	[ READER_FOLLOW ]: [ updateSeenOnFollow ],
} );
