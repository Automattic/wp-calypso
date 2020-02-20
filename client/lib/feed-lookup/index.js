/**
 * External dependencies
 */

import { isEmpty, head } from 'lodash';
import LruCache from 'lru';

/**
 * Internal Dependencies
 */
import { isRequestInflight } from 'lib/inflight';
import wpcom from 'lib/wp';

const cache = new LruCache( 10 );

function requestKey( feedId ) {
	return `feed-lookup-${ feedId }`;
}

function discover( feedUrl ) {
	const key = requestKey( feedUrl );
	//TODO this is busted. Fix when moving to redux.
	if ( isRequestInflight( key ) ) {
		return cache.get( feedUrl );
	}

	return wpcom.undocumented().discoverFeed( { url: feedUrl } );
}

function feedLookup( feedUrl ) {
	let promiseForFeedId = cache.get( feedUrl );

	if ( promiseForFeedId ) {
		return promiseForFeedId;
	}

	promiseForFeedId = discover( feedUrl ).then( function( response ) {
		if ( ! isEmpty( response.feeds ) ) {
			const feed = head( response.feeds );

			if ( ! isEmpty( feed.feed_ID ) ) {
				return feed.feed_ID;
			}
		}
	} );

	cache.set( feedUrl, promiseForFeedId );

	return promiseForFeedId;
}

export default feedLookup;
