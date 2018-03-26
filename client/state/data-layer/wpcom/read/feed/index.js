/** @format */
/**
 * External dependencies
 */
import { map, truncate } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_FEED_SEARCH_REQUEST } from 'state/action-types';
import { receiveFeedSearch } from 'state/reader/feed-searches/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import queryKey from 'state/reader/feed-searches/query-key';
import { bypassDataLayer } from 'state/data-layer/utils';

export function fromApi( apiResponse ) {
	const feeds = map( apiResponse.feeds, feed => ( {
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
	return bypassDataLayer( receiveFeedSearch( queryKey( action.payload ), feeds, total ) );
}

export function receiveReadFeedSearchError( action ) {
	const errorText = translate( 'Could not get results for query: %(query)s', {
		args: { query: truncate( action.payload.query, { length: 50 } ) },
	} );

	return errorNotice( errorText );
}

export default {
	[ READER_FEED_SEARCH_REQUEST ]: [
		dispatchRequestEx( {
			fetch: requestReadFeedSearch,
			onSuccess: receiveReadFeedSearchSuccess,
			onError: receiveReadFeedSearchError,
			fromApi,
		} ),
	],
};
