/** @format */

/**
 * Internal dependencies
 */
import { HAPPYCHAT_SET_MESSAGE } from 'state/action-types';

/**
 * Returns an action object that sets the current chat message
 *
 * @param  { String } message Current message to be set
 * @return { Object } Action object
 */
export const setChatMessage = message => ( { type: HAPPYCHAT_SET_MESSAGE, message } );
