/**
 * External dependencies
 */
import keyMirror from 'key-mirror';

/**
 * Module variables
 */
export const action = keyMirror( {
	FETCH_INVITES: null,
	FETCH_INVITE: null,
	RECEIVE_INVITES: null,
	RECEIVE_INVITE: null,
	RECEIVE_INVITES_ERROR: null,
	RECEIVE_INVITE_ERROR: null,
	DISPLAY_INVITE_ACCEPTED_NOTICE: null,
	DISMISS_INVITE_ACCEPTED_NOTICE: null,
	DISPLAY_INVITE_DECLINED_NOTICE: null,
	DISMISS_INVITE_DECLINED_NOTICE: null
} );
