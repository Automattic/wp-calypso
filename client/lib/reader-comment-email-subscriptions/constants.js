// External Dependencies
var keyMirror = require( 'key-mirror' );

export const action = keyMirror( {
	SUBSCRIBE_TO_COMMENT_EMAILS: null,
	UNSUBSCRIBE_FROM_COMMENT_EMAILS: null,
	RECEIVE_SUBSCRIBE_TO_COMMENT_EMAILS: null,
	RECEIVE_UNSUBSCRIBE_FROM_COMMENT_EMAILS: null,
} );

export const error = keyMirror( {
	UNABLE_TO_SUBSCRIBE: null,
	UNABLE_TO_UNSUBSCRIBE: null,
} );

export const state = keyMirror( {
	SUBSCRIBED: null,
	UNSUBSCRIBED: null,
} );
