// External Dependencies
var keyMirror = require( 'key-mirror' );

module.exports.action = keyMirror( {
	RECEIVE_TEAMS: null,
} );

module.exports.error = keyMirror( {
	UNABLE_TO_RECEIVE_TEAMS: null
} );
