/** @format */

/**
 * Internal dependencies
 */
import { HAPPYCHAT_SET_CHAT_STATUS } from 'state/action-types';

/**
 * Returns an action object that sets the current chat status
 *
 * @param  { String } status Current status to be set
 * @return { Object } Action object
 */
export const setHappychatChatStatus = status => ( {
	type: HAPPYCHAT_SET_CHAT_STATUS,
	status,
} );
