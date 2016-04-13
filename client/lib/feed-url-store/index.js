// External Dependencies
var Immutable = require( 'immutable' ),
	forEach = require( 'lodash/forEach' ),
	isEmpty = require( 'lodash/isEmpty' );

// Internal Dependencies
var FeedUrlCache = require( './cache' );

var FeedUrlStore = {
	get: function( key ) {
		return FeedUrlCache.get( key );
	},

	set: function( key, value ) {
		FeedUrlCache.set( key, value )
	},

	receiveFeeds: function( feedUrl, feeds ) {
		forEach( feeds, function( feed ) {
			if ( ! isEmpty( feed.feed_ID ) ) {
				FeedUrlStore.set( feedUrl, feed.feed_ID );
			}
		} );
	}
}

module.exports = FeedUrlStore;