/**
 * Internal dependencies
 */
import { createSelector } from '@automattic/state-utils';
import { getSectionName } from 'calypso/state/ui/selectors';

import 'calypso/state/happychat/init';

/**
 * Returns whether the docked happychat client UI should be displayed
 * The docked UI should not be displayed when viewing the happychat section
 *
 * @param {object} state - global redux state
 * @returns {boolean}
 */
export default createSelector(
	( state ) => state.happychat.ui.isOpen && getSectionName( state ) !== 'happychat',
	( state ) => [ state.happychat.ui.isOpen, getSectionName( state ) ]
);
