/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_OPEN
} from 'state/action-types';

const setChatOpen = isOpen => ( { type: HAPPYCHAT_OPEN, isOpen } );

/**
 * Set the Happychat sidebar dock to display
 * @returns {Object} Action
 */
export const openChat = () => setChatOpen( true );

/**
 * Se tthe Happychat sidebar dock to hide
 * @returns {Object} Action
 */
export const closeChat = () => setChatOpen( false );
