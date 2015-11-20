// External Dependencies
var keyMirror = require( 'react/lib/keyMirror' );

module.exports.action = keyMirror( {
	SUBSCRIBE_TO_COMMENT_EMAILS: null,
	UNSUBSCRIBE_FROM_COMMENT_EMAILS: null,
	RECEIVE_SUBSCRIBE_TO_COMMENT_EMAILS: null,
	RECEIVE_UNSUBSCRIBE_FROM_COMMENT_EMAILS: null,
} );

module.exports.error = keyMirror( {
	UNABLE_TO_SUBSCRIBE: null,
	UNABLE_TO_UNSUBSCRIBE: null,
} );

module.exports.state = keyMirror( {
	SUBSCRIBED: null,
	UNSUBSCRIBED: null,
} );
