/**
 * External dependencies
 */
import { map, truncate } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_FEED_SEARCH_REQUEST, READER_FEED_REQUEST } from 'state/reader/action-types';
import { receiveFeedSearch } from 'state/reader/feed-searches/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import queryKey from 'state/reader/feed-searches/query-key';
import {
	receiveReaderFeedRequestSuccess,
	receiveReaderFeedRequestFailure,
} from 'state/reader/feeds/actions';
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';

import { registerHandlers } from 'state/data-layer/handler-registry';

export function fromApi( apiResponse ) {
	const feeds = map( apiResponse.feeds, ( feed ) => ( {
		...feed,
		feed_URL: feed.subscribe_URL,
	} ) );

	const total = apiResponse.total > 200 ? 200 : apiResponse.total;

	return {
		feeds,
		total,
	};
}

export function requestReadFeedSearch( action ) {
	if ( ! ( action.payload && action.payload.query ) ) {
		return;
	}

	const path = '/read/feed';
	return http(
		{
			path,
			method: 'GET',
			apiVersion: '1.1',
			query: {
				q: action.payload.query,
				offset: action.payload.offset,
				exclude_followed: action.payload.excludeFollowed,
				sort: action.payload.sort,
			},
		},
		action
	);
}

export function receiveReadFeedSearchSuccess( action, data ) {
	const { feeds, total } = data;
	return receiveFeedSearch( queryKey( action.payload ), feeds, total );
}

export function receiveReadFeedSearchError( action ) {
	const errorText = translate( 'Could not get results for query: %(query)s', {
		args: { query: truncate( action.payload.query, { length: 50 } ) },
	} );

	return errorNotice( errorText );
}

export function requestReadFeed( action ) {
	return http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: `/read/feed/${ encodeURIComponent( action.payload.ID ) }`,
			retryPolicy: noRetry(),
		},
		action
	);
}

export function receiveReadFeedSuccess( action, response ) {
	return receiveReaderFeedRequestSuccess( response );
}

export function receiveReadFeedError( action, response ) {
	return receiveReaderFeedRequestFailure( action.payload.ID, response );
}

registerHandlers( 'state/data-layer/wpcom/read/feed/index.js', {
	[ READER_FEED_SEARCH_REQUEST ]: [
		dispatchRequest( {
			fetch: requestReadFeedSearch,
			onSuccess: receiveReadFeedSearchSuccess,
			onError: receiveReadFeedSearchError,
			fromApi,
		} ),
	],

	[ READER_FEED_REQUEST ]: [
		dispatchRequest( {
			fetch: requestReadFeed,
			onSuccess: receiveReadFeedSuccess,
			onError: receiveReadFeedError,
		} ),
	],
} );
