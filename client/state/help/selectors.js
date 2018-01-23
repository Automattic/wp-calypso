/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedOrPrimarySiteId } from 'state/selectors';
import { getSite } from 'state/sites/selectors';

export const getHelpSiteId = state => state.help.selectedSiteId;

/*
 * Returns the site the customer wishes to request help for. Returns in order of preference:
 *  - The site the customer has explicitly selected
 *  - A selected site
 *  - The primary site (which may not be available).
 *  - If any of the above is requested, but the full site object is not available, return the site with the lowest siteId.
 * @param state - global state
 * @returns {?Object} the help site or null
 */
export const getHelpSelectedSite = state => {
	const siteId = getHelpSiteId( state ) || getSelectedOrPrimarySiteId( state );
	const helpSite = getSite( state, siteId );
	// Are sites loaded but the help site is not available? We may have a bad site or primary.
	const sites = get( state, 'sites.items' );
	const siteKeys = sites && Object.keys( sites );
	if ( ! helpSite && siteKeys && siteKeys.length > 0 ) {
		const firstSiteId = siteKeys[ 0 ];
		return getSite( state, firstSiteId );
	}
	return helpSite;
};

/*
 * Returns the siteId the customer wishes to request help for. Returns in order of preference:
 *  - The siteId the customer has explicitly selected
 *  - A selected site id
 *  - The Primary Site (which may not be available).
 *  - If any of the above is requested, but the full site object is not available, return the site with the lowest siteId.
 * @param state - global state
 * @returns {?Object} the help site or null
 */
export const getHelpSelectedSiteId = state => {
	const site = getHelpSelectedSite( state );
	return get( site, 'ID', null );
};
