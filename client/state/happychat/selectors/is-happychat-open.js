/** @format */

/**
 * Internal dependencies
 */
import createSelector from 'client/lib/create-selector';
import { getSectionName } from 'client/state/ui/selectors';

/**
 * Returns wether the docked happychat client UI should be displayed
 * The docked UI should not be displayed when viewing the happychat section
 * @param {Object} state - global redux state
 * @returns {Boolean}
 */
export default createSelector(
	state => state.happychat.ui.isOpen && getSectionName( state ) !== 'happychat',
	state => [ state.happychat.ui.isOpen, getSectionName( state ) ]
);
