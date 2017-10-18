/** @format */

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_OPEN,
	HAPPYCHAT_MINIMIZING,
	HAPPYCHAT_BLUR,
	HAPPYCHAT_FOCUS,
} from 'state/action-types';

const setChatOpen = isOpen => ( { type: HAPPYCHAT_OPEN, isOpen } );
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
