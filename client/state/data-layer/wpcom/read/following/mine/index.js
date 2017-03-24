/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { map, get, omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOWS_SYNC_START,
	READER_FOLLOWS_SYNC_PAGE,
} from 'state/action-types';
import { updateFeeds as updateFeedsAction } from 'state/reader/feeds/actions';
import { receiveFollows as receiveFollowsAction } from 'state/reader/follows/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';

export const requestPageAction = ( page = 1, number = 50, meta = 'feed' )=> ( {
	type: READER_FOLLOWS_SYNC_PAGE,
	payload: { page, meta, number, }
} );

export const feedsFromApi = apiResponse =>
	map( apiResponse.subscriptions, subscription =>
		get( subscription, 'meta.data.feed' )
	);

export const subscriptionsFromApi = apiResponse =>
	map( apiResponse.subscriptions, subscription =>
		omit( subscription, 'meta' )
	);

export const isValidApiResponse = ( apiResponse, action ) => {
	const hasSubscriptions = apiResponse && apiResponse.subscriptions;
	const hasFeedsIfRequested = (
		// if either at end of pages or didn't request feeds then return true
		( apiResponse.number === 0 || action.payload.meta.indexOf( 'feed' ) === -1 ) ||
		// if there are subs and feeds were requested, then they should in the apiResponse
		( hasSubscriptions && get( apiResponse.subscriptions[ 0 ], 'meta.data.feed' ) )
	);

	return hasSubscriptions && hasFeedsIfRequested;
};

let syncingFollows = false;
export const isSyncingFollows = () => syncingFollows;

export function syncReaderFollows( store, action, next ) {
	if ( isSyncingFollows() ) {
		return;
	}

	syncingFollows = true;

	store.dispatch( requestPageAction( 1 ) );

	next( action );
}

export function requestPage( store, action, next ) {
	store.dispatch( http( {
		method: 'GET',
		path: '/read/following/mine',
		apiVersion: '1.2',
		query: {
			page: action.payload.page,
			number: action.payload.number,
			meta: action.payload.meta,
		},
		onSuccess: action,
		onError: action,
	} ) );

	next( action );
}

const MAX_PAGES_TO_FETCH = 40; // TODO what should be the number here?
export function receivePage( store, action, next, apiResponse ) {
	if ( ! isValidApiResponse( apiResponse, action ) ) {
		receiveError( store, action, next, apiResponse );
		return;
	}

	const { page, number } = apiResponse;

	store.dispatch(
		receiveFollowsAction( subscriptionsFromApi( apiResponse ) )
	);

	store.dispatch( updateFeedsAction( feedsFromApi( apiResponse ) ) );

	// Fetch the next page of subscriptions where applicable
	if ( number > 0 && page <= MAX_PAGES_TO_FETCH && isSyncingFollows() ) {
		store.dispatch( requestPageAction( page + 1 ) );
		return;
	}
	syncingFollows = false;
}

export function receiveError( store ) {
	syncingFollows = false;
	store.dispatch(
		errorNotice( translate( 'Sorry, we had a problem fetching your Reader subscriptions.' ) )
	);
}

export default {
	[ READER_FOLLOWS_SYNC_START ]: [ syncReaderFollows ],
	[ READER_FOLLOWS_SYNC_PAGE ]: [ dispatchRequest( requestPage, receivePage, receiveError ) ],
};
