/**
 * External dependencies
 */
import { has } from 'lodash';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_RECEIVE_EVENT,
} from 'state/action-types';

const isAudioSupported = typeof Audio === 'function';

export const playSound = src => {
	if ( ! isAudioSupported ) {
		return;
	}

	const audioClip = new Audio( src );
	audioClip.play();
};

export const onHappyChatMessage = ( dispatch, { event } ) => {
	event.source !== 'customer' && playSound( '/calypso/audio/chat-pling.wav' );
};

/**
 * Action Handlers
 */

// Initialized this way for performance reasons
export const handlers = Object.create( null );
handlers[ HAPPYCHAT_RECEIVE_EVENT ] = onHappyChatMessage;

/**
 * Middleware
 */

export default ( { dispatch, getState } ) => ( next ) => ( action ) => {
	if ( ! isAudioSupported ) {
		return;
	}

	const handler = handlers[ action.type ];
	if ( 'function' === typeof handler ) {
		handler( dispatch, action, getState );
	}

	return next( action );
};
