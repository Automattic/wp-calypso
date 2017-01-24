
/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_RECEIVE_EVENT,
	AUDIO_PLAY,
} from 'state/action-types';
import { audioPlay } from './actions';

// Maps the audio reference to the audio file source.
// In future we might want to store this in Redux if
// we want the sounds to be configurable.
const REFERENCE_MAP = {
	'happychat-message-received': '/calypso/audio/chat-pling.wav',
};

/**
 * Plays a sound when a message is received on Happychat
 * @param {function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 */
export const dispatchHappychatSound = ( dispatch, { event } ) => {
	// Don't play a sound when the customer sends a message
	if ( event.source === 'customer' ) {
		return;
	}

	dispatch( audioPlay( 'happychat-message-received' ) );
};

export const playSound = ( dispatch, { reference } ) => {
	if ( typeof Audio !== 'function' ) {
		// No Audio support in this browser
		return;
	}

	const audio = new Audio( REFERENCE_MAP[ reference ] );
	audio.play();
};

/**
 * Action Handlers
 */

export const handlers = {
	// Actions which trigger a sound
	[ HAPPYCHAT_RECEIVE_EVENT ]: dispatchHappychatSound,

	// Actually plays the sound
	[ AUDIO_PLAY ]: playSound,
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
