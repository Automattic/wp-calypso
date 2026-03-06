import { translate } from 'i18n-calypso';
import { map, truncate } from 'lodash';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { READER_FEED_SEARCH_REQUEST } from 'calypso/state/reader/action-types';
import { receiveFeedSearch } from 'calypso/state/reader/feed-searches/actions';
import queryKey from 'calypso/state/reader/feed-searches/query-key';

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

registerHandlers( 'state/data-layer/wpcom/read/feed/index.js', {
	[ READER_FEED_SEARCH_REQUEST ]: [
		dispatchRequest( {
			fetch: requestReadFeedSearch,
			onSuccess: receiveReadFeedSearchSuccess,
			onError: receiveReadFeedSearchError,
			fromApi,
		} ),
	],
} );
