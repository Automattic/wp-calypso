// External Dependencies
var keyMirror = require( 'react/lib/keyMirror' );

module.exports.action = keyMirror( {
	ADD_COMMENT: null,
	RECEIVE_ADD_COMMENT: null,
	REPLY_TO_COMMENT: null,
	RECEIVE_REPLY_TO_COMMENT: null,
	RECEIVE_POST_COMMENTS: null,
} );

module.exports.state = keyMirror( {
	PENDING: null,
	COMPLETE: null,
	ERROR: null,
} );