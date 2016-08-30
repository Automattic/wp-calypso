/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSectionName } from 'state/ui/selectors';

export const isHappychatOpen = createSelector(
	state => state.ui.happychat.open && getSectionName( state ) !== 'happychat',
	state => [ state.ui.happychat.open, getSectionName( state ) ]
);
