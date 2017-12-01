/** @format */

/**
 * Internal dependencies
 */

import { getSelectedOrPrimarySiteId } from 'state/selectors';
import { getSite } from 'state/sites/selectors';

export const getHelpSiteId = state => state.help.selectedSiteId;

export const getHelpSelectedSite = state => {
	const siteId = getHelpSiteId( state ) || getSelectedOrPrimarySiteId( state );

	return getSite( state, siteId );
};

export const getHelpSelectedSiteId = state => {
	const site = getHelpSelectedSite( state );

	if ( site && site.ID ) {
		return site.ID;
	}
	return null;
};
