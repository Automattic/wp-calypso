// External Dependencies
var keyMirror = require( 'key-mirror' );

module.exports.action = keyMirror( {
	BLOCK_SITE: null,
	RECEIVE_BLOCK_SITE: null,
	UNBLOCK_SITE: null,
	RECEIVE_UNBLOCK_SITE: null,
	DISMISS_BLOCK_ERROR: null
} );

module.exports.error = keyMirror( {
	UNABLE_TO_BLOCK: null,
	UNABLE_TO_UNBLOCK: null
} );
