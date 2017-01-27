
/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_RECEIVE_EVENT,
} from 'state/action-types';

// Maps the audio reference to the audio file source.
// In future we might want to store this in Redux if
// we want the sounds to be configurable.
const REFERENCE_MAP = {
	'happychat-message-received': '/calypso/audio/chat-pling.wav',
};

export const playSound = reference => {
	if ( typeof Audio !== 'function' ) {
		// No Audio support in this browser
		return;
	}

	const audio = new Audio( REFERENCE_MAP[ reference ] );
	audio.play();
};

export const onHappyChatMessage = ( dispatch, { event } ) => {
	event.source !== 'customer' && playSound( 'happychat-message-received' );
};

/**
 * Action Handlers
 */

export const handlers = {
	// Actions which trigger a sound
	[ HAPPYCHAT_RECEIVE_EVENT ]: onHappyChatMessage,
};

/**
 * Middleware
 */

export default ( { dispatch, getState } ) => ( next ) => ( action ) => {
	if ( handlers.hasOwnProperty( action.type ) ) {
		handlers[ action.type ]( dispatch, action, getState );
	}

	return next( action );
};
