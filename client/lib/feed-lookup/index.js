// External Dependencies
var isEmpty = require( 'lodash/isEmpty' ),
	head = require( 'lodash/head' ),
	lruCache = require( 'lru-cache' );

// Internal Dependencies
var inflight = require( 'lib/inflight' ),
	wpcom = require( 'lib/wp' );

const cache = lruCache( 10 );

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
	var feedId = cache.get( feedUrl );

	if ( feedId ) {
		return feedId;
	}

	feedId = discover( feedUrl ).then( function( response ) {
		var feed;

		if ( ! isEmpty( response.feeds ) ) {
			feed = head( response.feeds );

			if ( ! isEmpty( feed.feed_ID ) ) {
				return feed.feed_ID;
			}
		}
	} );

	cache.set( feedUrl, feedId );

	return feedId;
}

module.exports = feedLookup;
