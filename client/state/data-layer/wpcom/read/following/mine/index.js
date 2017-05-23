/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { forEach, map, omitBy, isArray, isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import followingNew from './new';
import followingDelete from './delete';
import {
	READER_FOLLOW,
	READER_FOLLOWS_SYNC_START,
	READER_FOLLOWS_SYNC_PAGE,
} from 'state/action-types';
import { receiveFollows as receiveFollowsAction, syncComplete } from 'state/reader/follows/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { toValidId } from 'reader/id-helpers';

const ITEMS_PER_PAGE = 200;
const MAX_ITEMS = 2000;

export const requestPageAction = ( page = 1, number = ITEMS_PER_PAGE, meta = '' ) => ( {
	type: READER_FOLLOWS_SYNC_PAGE,
	payload: { page, meta, number },
} );

export const isValidApiResponse = apiResponse => {
	const hasSubscriptions =
		apiResponse && apiResponse.subscriptions && isArray( apiResponse.subscriptions );
	return hasSubscriptions;
};

export const subscriptionFromApi = subscription =>
	subscription &&
	omitBy(
		{
			ID: Number( subscription.ID ),
			URL: subscription.URL,
			feed_URL: subscription.URL,
			blog_ID: toValidId( subscription.blog_ID ),
			feed_ID: toValidId( subscription.feed_ID ),
			date_subscribed: Date.parse( subscription.date_subscribed ),
			delivery_methods: subscription.delivery_methods,
			is_owner: subscription.is_owner,
		},
		isUndefined
	);

export const subscriptionsFromApi = apiResponse => {
	if ( ! isValidApiResponse( apiResponse ) ) {
		return [];
	}
	return map( apiResponse.subscriptions, subscriptionFromApi );
};

let syncingFollows = false;
let seenSubscriptions = null;
export const isSyncingFollows = () => syncingFollows;
export const resetSyncingFollows = () => syncingFollows = false;

export function syncReaderFollows( store ) {
	if ( isSyncingFollows() ) {
		return;
	}

	syncingFollows = true;
	seenSubscriptions = new Set();

	store.dispatch( requestPageAction( 1 ) );
}

export function requestPage( store, action ) {
	store.dispatch(
		http( {
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
		} )
	);
}

const MAX_PAGES_TO_FETCH = MAX_ITEMS / ITEMS_PER_PAGE;

export function receivePage( store, action, next, apiResponse ) {
	if ( ! isValidApiResponse( apiResponse, action ) ) {
		receiveError( store, action, next, apiResponse );
		return;
	}

	const { page, number } = apiResponse;
	const follows = subscriptionsFromApi( apiResponse );
	store.dispatch(
		receiveFollowsAction( {
			follows,
			totalCount: apiResponse.total_subscriptions,
		} )
	);

	forEach( follows, follow => {
		seenSubscriptions.add( follow.feed_URL );
	} );

	// Fetch the next page of subscriptions where applicable
	if ( number > 0 && page <= MAX_PAGES_TO_FETCH && isSyncingFollows() ) {
		store.dispatch( requestPageAction( page + 1 ) );
		return;
	}
	// all done syncing
	store.dispatch( syncComplete( Array.from( seenSubscriptions ) ) );

	seenSubscriptions = null;
	syncingFollows = false;
}

export function updateSeenOnFollow( store, action ) {
	if ( seenSubscriptions ) {
		seenSubscriptions.add( action.payload.feedUrl );
	}
}

export function receiveError( store ) {
	syncingFollows = false;
	store.dispatch(
		errorNotice( translate( 'Sorry, we had a problem fetching your Reader subscriptions.' ) )
	);
}

const followingMine = {
	[ READER_FOLLOWS_SYNC_START ]: [ syncReaderFollows ],
	[ READER_FOLLOWS_SYNC_PAGE ]: [ dispatchRequest( requestPage, receivePage, receiveError ) ],
	[ READER_FOLLOW ]: [ updateSeenOnFollow ],
};

export default mergeHandlers( followingMine, followingNew, followingDelete );
