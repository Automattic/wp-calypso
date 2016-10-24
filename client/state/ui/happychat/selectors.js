/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSectionName } from 'state/ui/selectors';

/**
 * Returns wether the docked happychat client UI should be displayed
 * The docked UI should not be displayed when viewing the happychat section
 *
 * @param {Object} state - global redux state
 * @returns {Boolean}
 */
export const isHappychatOpen = createSelector(
	state => state.ui.happychat.open && getSectionName( state ) !== 'happychat',
	state => [ state.ui.happychat.open, getSectionName( state ) ]
);

/**
 * Gets the current happychat minimizing status
 * @param {Object} state - global redux state
 * @return {String} current state value
 */
export const isHappychatMinimizing = createSelector(
	state => state.ui.happychat.isMinimizing,
	state => state.ui.happychat.isMinimizing
);
