// External Dependencies
var isEmpty = require( 'lodash/isEmpty' ),
	head = require( 'lodash/head' ),
	lruCache = require( 'lru-cache' );

// Internal Dependencies
var inflight = require( 'lib/inflight' ),
	wpcom = require( 'lib/wp' );

const cache = lruCache( 10 );

var FeedLookupCache = {
	get: function( url ) {
		return cache.get( url );
	},

	set: function( url, id ) {
		cache.set( url, id );
	}
};

function requestKey( feedId ) {
	return `feed-lookup-${feedId}`;
}

function discover( feedUrl ) {
	const key = requestKey( feedUrl );

	if ( inflight.requestInflight( key ) ) {
		return;
	}

	return wpcom.undocumented().discoverFeed(
		{ url: feedUrl }
	);
};

var FeedLookup = {
	get: function( feedUrl ) {
		var feedId = FeedLookupCache.get( feedUrl );

		if ( feedId ) {
			return feedId;
		}

		feedId = new Promise( ( resolve, reject ) => {
			discover( feedUrl )
				.then( function( response ) {
					if ( ! isEmpty( response.feeds ) ) {
						var feed = head( response.feeds );

						if ( ! isEmpty( feed.feed_ID ) ) {
							resolve( feed.feed_ID );
						}
					}

					reject();
				} )
				.catch( function( error ) {
					reject( error );
				} );
		} );

		FeedLookupCache.set( feedUrl, feedId );

		return feedId;
	}
}

module.exports = FeedLookup;
