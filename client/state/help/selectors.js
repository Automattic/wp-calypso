/**
 * Internal dependencies
 */
import { getSelectedOrPrimarySiteId } from 'state/selectors';
import { getSite } from 'state/sites/selectors';
import createSelector from 'lib/create-selector';

export const getHelpSelectedSiteId = createSelector(
	state => state.help.selectedSiteId
);

export const getHelpSelectedSite = ( state ) => {
	const siteId = getHelpSelectedSiteId( state ) || getSelectedOrPrimarySiteId( state );

	return getSite( state, siteId );
};
