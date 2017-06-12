/**
 * Internal dependencies
 */
import { getPrimarySiteId } from 'state/selectors';
import { getRawSite } from 'state/sites/selectors';
import createSelector from 'lib/create-selector';

export const getHelpSelectedSiteId = createSelector(
	state => state.help.selectedSiteId
);

export const getHelpSelectedSite = ( state ) => {
	const siteId = getHelpSelectedSiteId( state ) || getPrimarySiteId( state );

	return getRawSite( state, siteId );
};
