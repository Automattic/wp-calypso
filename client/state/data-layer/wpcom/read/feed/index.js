/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { map, truncate } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_FEED_SEARCH_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { receiveFeedSearch } from 'state/reader/feed-searches/actions';
import queryKey from 'state/reader/feed-searches/query-key';

export function initiateFeedSearch( store, action ) {
	if ( ! ( action.payload && action.payload.query ) ) {
		return;
	}

	const path = '/read/feed';
	store.dispatch(
		http( {
			path,
			method: 'GET',
			apiVersion: '1.1',
			query: {
				q: action.payload.query,
				offset: action.payload.offset,
				exclude_followed: action.payload.excludeFollowed,
				sort: action.payload.sort,
			},
			onSuccess: action,
			onFailure: action,
		} )
	);
}

export function receiveFeeds( store, action, apiResponse ) {
	const feeds = map( apiResponse.feeds, feed => ( {
		...feed,
		feed_URL: feed.subscribe_URL,
	} ) );

	const total = apiResponse.total > 200 ? 200 : apiResponse.total;
	store.dispatch( receiveFeedSearch( queryKey( action.payload ), feeds, total ) );
}

export function receiveError( store, action, error ) {
	if ( process.env.NODE_ENV === 'development' ) {
		console.error( action, error ); // eslint-disable-line no-console
	}

	const errorText = translate( 'Could not get results for query: %(query)s', {
		args: { query: truncate( action.payload.query, { length: 50 } ) },
	} );
	store.dispatch( errorNotice( errorText ) );
}

export default {
	[ READER_FEED_SEARCH_REQUEST ]: [
		dispatchRequest( initiateFeedSearch, receiveFeeds, receiveError ),
	],
};
