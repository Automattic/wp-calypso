// External Dependencies
var isEmpty = require( 'lodash/isEmpty' ),
	head = require( 'lodash/head' ),
	LruCache = require( 'lru' );

// Internal Dependencies
var inflight = require( 'lib/inflight' ),
	wpcom = require( 'lib/wp' );

const cache = new LruCache( 10 );

function requestKey( feedId ) {
	return `feed-lookup-${feedId}`;
}

function discover( feedUrl ) {
	const key = requestKey( feedUrl );

	if ( inflight.requestInflight( key ) ) {
		return cache.get( feedUrl );
	}

	return wpcom.undocumented().discoverFeed(
		{ url: feedUrl }
	);
};

function feedLookup( feedUrl ) {
	var promiseForFeedId = cache.get( feedUrl );

	if ( promiseForFeedId ) {
		return promiseForFeedId;
	}

	promiseForFeedId = discover( feedUrl ).then( function( response ) {
		var feed;

		if ( ! isEmpty( response.feeds ) ) {
			feed = head( response.feeds );

			if ( ! isEmpty( feed.feed_ID ) ) {
				return feed.feed_ID;
			}
		}
	} );

	cache.set( feedUrl, promiseForFeedId );

	return promiseForFeedId;
}

module.exports = feedLookup;
