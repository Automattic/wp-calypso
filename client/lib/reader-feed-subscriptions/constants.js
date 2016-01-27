// External Dependencies
var keyMirror = require( 'key-mirror' );

module.exports.action = keyMirror( {
	FOLLOW_READER_FEED: null,
	UNFOLLOW_READER_FEED: null,
	RECEIVE_FOLLOW_READER_FEED: null,
	RECEIVE_FOLLOW_READER_FEED_ERROR: null,
	RECEIVE_FOLLOW_READER_FEED_COMPLETE: null,
	RECEIVE_UNFOLLOW_READER_FEED: null,
	DISMISS_FOLLOW_ERROR: null,
	RECEIVE_FEED_SUBSCRIPTIONS: null,
	FETCH_NEXT_FEED_SUBSCRIPTIONS_PAGE: null,
	RESET_FEED_SUBSCRIPTIONS_STATE: null
} );

module.exports.error = keyMirror( {
	UNABLE_TO_FOLLOW: null,
	UNABLE_TO_UNFOLLOW: null,
} );

module.exports.state = keyMirror( {
	SUBSCRIBED: null,
	UNSUBSCRIBED: null,
} );
