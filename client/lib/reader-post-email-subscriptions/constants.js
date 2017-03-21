// External Dependencies
var keyMirror = require( 'key-mirror' );

export const action = keyMirror( {
	SUBSCRIBE_TO_POST_EMAILS: null,
	UNSUBSCRIBE_FROM_POST_EMAILS: null,
	UPDATE_POST_EMAIL_DELIVERY_FREQUENCY: null,
	RECEIVE_SUBSCRIBE_TO_POST_EMAILS: null,
	RECEIVE_UPDATE_POST_EMAIL_DELIVERY_FREQUENCY: null,
	RECEIVE_UNSUBSCRIBE_FROM_POST_EMAILS: null,
} );

export const error = keyMirror( {
	UNABLE_TO_SUBSCRIBE: null,
	UNABLE_TO_UNSUBSCRIBE: null,
	UNABLE_TO_UPDATE_DELIVERY_FREQUENCY: null
} );

export const state = keyMirror( {
	SUBSCRIBED: null,
	UNSUBSCRIBED: null,
} );
