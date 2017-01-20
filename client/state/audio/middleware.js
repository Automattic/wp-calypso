
/**
 * Internal dependencies
 */
import audioRepo from './audio-repo';
import {
	HAPPYCHAT_RECEIVE_EVENT,
	AUDIO_PLAY,
} from 'state/action-types';
import { audioPlay } from './actions';
import { getAudioSourceForSprite } from './selectors';

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

export const playSprite = ( dispatch, { sprite } ) => {
	audioRepo
		.get( sprite, getAudioSourceForSprite( sprite ) )
		.play();
};

/**
 * Action Handlers
 */

export const handlers = {
	// Actions which trigger a sound
	[ HAPPYCHAT_RECEIVE_EVENT ]: dispatchHappychatSound,

	// Actually plays the sound
	[ AUDIO_PLAY ]: playSprite,
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
