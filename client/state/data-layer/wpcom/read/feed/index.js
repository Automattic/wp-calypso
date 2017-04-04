/**
 * Internal dependencies
 */
import { READER_FEED_SEARCH_REQUEST } from 'state/action-types';
import { receiveFeedSearch } from 'state/reader/feed-searches/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';

export function initiateFeedSearch( store, action, next ) {
	if ( ! ( action.payload && action.payload.query ) ) {
		return;
	}

	const path = '/read/feed';
	store.dispatch( http( {
		path,
		method: 'GET',
		apiVersion: '1.1',
		query: { q: action.payload.query },
		onSuccess: action,
		onFailure: action,
	} ) );

	next( action );
}

export function receiveFeeds( store, action, next, apiResponse ) {
	const feeds = apiResponse.feeds;

	store.dispatch(
		receiveFeedSearch( action.payload.query, feeds )
	);
}

export function receiveError( store, action, next, error ) {
	if ( process.env.NODE_ENV === 'development' ) {
		console.error( action, error ); // eslint-disable-line no-console
	}

	const errorText = translate( 'Could not get results for query: %(query)s', {
		args: { query: action.payload.query }
	} );
	store.dispatch( errorNotice( errorText ) );
}

export default {
	[ READER_FEED_SEARCH_REQUEST ]: [ dispatchRequest(
			initiateFeedSearch,
			receiveFeeds,
			receiveError
		) ],
};

