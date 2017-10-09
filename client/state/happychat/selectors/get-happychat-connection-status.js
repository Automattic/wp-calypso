/**
 * External dependencies
 *
 * @format
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Gets the current happychat connection status
 * @param {Object} state - global redux state
 * @return {String} current state value
 */
export default createSelector( state => get( state, 'happychat.connection.status' ) );
