/** @format */
/**
 * External dependencies
 */
import keyMirror from 'key-mirror';

export const actions = keyMirror( {
	// Sending a request for an SMS auth code
	AUTH_CODE_REQUEST: null,
	// Request for an SMS auth code has completed
	RECEIVE_AUTH_CODE_REQUEST: null,
	// Reset the SMS state
	RESET_AUTH_CODE_REQUEST: null,
} );
