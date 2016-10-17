/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_OPEN,
	HAPPYCHAT_MINIMIZING
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
