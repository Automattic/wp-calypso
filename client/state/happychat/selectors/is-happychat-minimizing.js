/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Gets the current happychat minimizing status
 * @param {Object} state - global redux state
 * @return {String} current state value
 */
export default state => get( state, 'happychat.ui.isMinimizing' );
