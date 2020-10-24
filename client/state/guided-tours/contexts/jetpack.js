/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * Returns true if the current site is a jetpack site.
 * Used in activity log tours.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if site is Jetpack, false otherwise.
 */
export const isSelectedSiteJetpack = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return siteId ? isJetpackSite( state, siteId ) : false;
};

/**
 * Returns true if the current site is not a jetpack site.
 * Used in activity log tours.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True is not Jetpack, false otherwise.
 */
export const isSelectedSiteNotJetpack = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return siteId ? ! isJetpackSite( state, siteId ) : false;
};
