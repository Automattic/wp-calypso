/** @format **/

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_BLUR,
	HAPPYCHAT_FOCUS,
	HAPPYCHAT_SET_CHAT_STATUS,
} from 'state/action-types';

export const setHappychatChatStatus = status => ( {
	type: HAPPYCHAT_SET_CHAT_STATUS,
	status,
} );

export const blur = () => ( { type: HAPPYCHAT_BLUR } );
export const focus = () => ( { type: HAPPYCHAT_FOCUS } );
