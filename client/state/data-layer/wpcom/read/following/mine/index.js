/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { map, omit, isArray } from 'lodash';

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

export const requestPageAction = ( page = 1, number = 50, meta = '' )=> ( {
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

	return map( apiResponse.subscriptions, subscription =>
		omit( subscription, 'meta' )
	);
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
