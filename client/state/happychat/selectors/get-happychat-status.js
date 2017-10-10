/** @format **/

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Gets the current chat session status
 * @param {Object} state - global redux state
 * @return {String} status of the current chat session
 */
export default createSelector( state => state.happychat.chat.status );
