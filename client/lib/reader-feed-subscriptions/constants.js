// External Dependencies
var keyMirror = require( 'key-mirror' );

export const action = keyMirror( {
	FOLLOW_READER_FEED: null,
	UNFOLLOW_READER_FEED: null,
	RECEIVE_FOLLOW_READER_FEED: null,
	RECEIVE_UNFOLLOW_READER_FEED: null,
	DISMISS_FOLLOW_ERROR: null,
	RECEIVE_FEED_SUBSCRIPTIONS: null,
	FETCH_NEXT_FEED_SUBSCRIPTIONS_PAGE: null
} );

export const error = keyMirror( {
	UNABLE_TO_FOLLOW: null,
	UNABLE_TO_UNFOLLOW: null,
} );

export const state = keyMirror( {
	SUBSCRIBED: null,
	UNSUBSCRIBED: null,
} );
