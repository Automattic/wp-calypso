/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { map, omitBy, isArray, isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOWS_SYNC_START,
	READER_FOLLOWS_SYNC_PAGE,
} from 'state/action-types';
import { receiveFollows as receiveFollowsAction } from 'state/reader/follows/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { toValidId } from 'reader/id-helpers';

const ITEMS_PER_PAGE = 200;
const MAX_ITEMS = 2000;

export const requestPageAction = ( page = 1, number = ITEMS_PER_PAGE, meta = '' )=> ( {
	type: READER_FOLLOWS_SYNC_PAGE,
	payload: { page, meta, number, }
} );

export const isValidApiResponse = apiResponse => {
	const hasSubscriptions = apiResponse && apiResponse.subscriptions &&
		isArray( apiResponse.subscriptions );
	return hasSubscriptions;
};

export const subscriptionsFromApi = apiResponse => {
	if ( ! isValidApiResponse( apiResponse ) ) {
		return [];
	}

	return map( apiResponse.subscriptions, subscription => {
		return omitBy( {
			ID: Number( subscription.ID ),
			URL: subscription.URL,
			blog_ID: toValidId( subscription.blog_ID ),
			feed_ID: toValidId( subscription.feed_ID ),
			date_subscribed: Date.parse( subscription.date_subscribed ),
			delivery_methods: subscription.delivery_methods,
			is_owner: subscription.is_owner,
		}, isUndefined );
	} );
};

let syncingFollows = false;
export const isSyncingFollows = () => syncingFollows;
export const resetSyncingFollows = () => syncingFollows = false;

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

const MAX_PAGES_TO_FETCH = MAX_ITEMS / ITEMS_PER_PAGE;
export function receivePage( store, action, next, apiResponse ) {
	if ( ! isValidApiResponse( apiResponse, action ) ) {
		receiveError( store, action, next, apiResponse );
		return;
	}

	const { page, number } = apiResponse;

	store.dispatch(
		receiveFollowsAction( subscriptionsFromApi( apiResponse ) )
	);

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
