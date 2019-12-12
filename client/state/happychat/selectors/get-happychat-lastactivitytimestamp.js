/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Gets the lastActivityTimestamp
 * @param {Object} state - global redux state
 * @return {String} current state value
 */
export default state => get( state, 'happychat.chat.lastActivityTimestamp' );
