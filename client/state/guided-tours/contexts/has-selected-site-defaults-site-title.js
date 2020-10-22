/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { hasDefaultSiteTitle } from 'calypso/state/sites/selectors';

/**
 * Returns true if the selected site has an unchanged site title
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if site title is default, false otherwise.
 */
export const hasSelectedSiteDefaultSiteTitle = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return siteId ? hasDefaultSiteTitle( state, siteId ) : false;
};
