/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Gets the current happychat chat status
 *
 * @param {object} state - global redux state
 * @returns {string} current state value
 */
export default ( state ) => get( state, 'happychat.chat.status' );
