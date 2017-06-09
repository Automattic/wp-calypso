/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

export const getHelpSelectedSiteId = createSelector(
	state => state.help.selectedSiteId
);
