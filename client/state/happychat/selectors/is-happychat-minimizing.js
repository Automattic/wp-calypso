/** @format */
/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Gets the current happychat minimizing status
 * @param {Object} state - global redux state
 * @return {String} current state value
 */
export default createSelector( state => state.happychat.ui.isMinimizing );
