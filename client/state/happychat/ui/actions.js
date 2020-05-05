/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_OPEN,
	HAPPYCHAT_MINIMIZING,
	HAPPYCHAT_BLUR,
	HAPPYCHAT_FOCUS,
	HAPPYCHAT_SET_CURRENT_MESSAGE,
} from 'state/action-types';

const setChatOpen = ( isOpen ) => ( { type: HAPPYCHAT_OPEN, isOpen } );
const setChatMinimizing = ( isMinimizing ) => ( { type: HAPPYCHAT_MINIMIZING, isMinimizing } );

/**
 * Set the Happychat sidebar dock to display
 *
 * @returns {object} Action
 */
export const openChat = () => setChatOpen( true );

/**
 * Set the Happychat sidebar dock to start minimizing
 *
 * @returns {object} Action
 */
export const minimizeChat = () => setChatMinimizing( true );

/**
 * Set the Happychat sidebar dock to finish minimizing
 *
 * @returns {object} Action
 */
export const minimizedChat = () => setChatMinimizing( false );

/**
 * Set the Happychat sidebar dock to hide
 *
 * @returns {object} Action
 */
export const closeChat = () => setChatOpen( false );

/**
 * Indicates Happychat component lost focus
 *
 * @returns {object} Action
 */
export const blur = () => ( { type: HAPPYCHAT_BLUR } );

/**
 * Indicates Happychat component gained focus
 *
 * @returns {object} Action
 */
export const focus = () => ( { type: HAPPYCHAT_FOCUS } );

/**
 * Returns an action object that sets the current chat message
 *
 * @param  {string} message Current message to be set
 * @returns {object} Action object
 */
export const setCurrentMessage = ( message ) => ( {
	type: HAPPYCHAT_SET_CURRENT_MESSAGE,
	message,
} );
