/** @format */

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_OPEN,
	HAPPYCHAT_ACTIVITY,
	HAPPYCHAT_MINIMIZING,
	HAPPYCHAT_BLUR,
	HAPPYCHAT_FOCUS,
	HAPPYCHAT_SET_CURRENT_MESSAGE,
	HAPPYCHAT_PANEL_HIDE,
	HAPPYCHAT_PANEL_SHOW,
} from 'state/action-types';

// TODO: rework action these names to eliminate confusion

/**
 * Hide the happychat panel
 * @returns {Object} Action
 */
export const hidePanel = () => ( { type: HAPPYCHAT_PANEL_HIDE } );

/**
 * Show the happychat panel
 * @returns {Object} Action
 */
export const showPanel = () => ( { type: HAPPYCHAT_PANEL_SHOW } );

/**
 * Set the Happychat panel to display
 *
 * @param  {boolean} isOpen If chat is open or not
 * @returns {Object} Action
 */
export const setChatOpen = isOpen => ( { type: HAPPYCHAT_OPEN, isOpen } );

const setChatMinimizing = isMinimizing => ( { type: HAPPYCHAT_MINIMIZING, isMinimizing } );

/**
 * Set the Happychat sidebar dock to display
 * @returns {Object} Action
 */
export const openChat = () => setChatOpen( true );

/**
 * Set the Happychat sidebar dock to start minimizing
 * @returns {Object} Action
 */
export const minimizeChat = () => setChatMinimizing( true );

/**
 * Set the Happychat sidebar dock to finish minimizing
 * @returns {Object} Action
 */
export const minimizedChat = () => setChatMinimizing( false );

/**
 * Set the Happychat sidebar dock to hide
 * @returns {Object} Action
 */
export const closeChat = () => setChatOpen( false );

/**
 * Indicates Happychat component lost focus
 * @returns {Object} Action
 */
export const blur = () => ( { type: HAPPYCHAT_BLUR } );

/**
 * Indicates Happychat component gained focus
 * @returns {Object} Action
 */
export const focus = () => ( { type: HAPPYCHAT_FOCUS } );

export const updateActivity = () => ( { type: HAPPYCHAT_ACTIVITY } );
/**
 * Returns an action object that sets the current chat message
 *
 * @param  { String } message Current message to be set
 * @return { Object } Action object
 */
export const setCurrentMessage = message => ( { type: HAPPYCHAT_SET_CURRENT_MESSAGE, message } );
