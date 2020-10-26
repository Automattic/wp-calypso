/**
 * Internal dependencies
 */
import getSite from 'calypso/state/sites/selectors/get-site';
import getSelectedSiteId from './get-selected-site-id';

/**
 * @typedef { import("./site-data").SiteData } SiteData
 */

/**
 * Returns the site object for the currently selected site.
 *
 * @param  {object}  state  Global state tree
 * @returns {SiteData|null}        Selected site
 */
export default function getSelectedSite( state ) {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return null;
	}

	return getSite( state, siteId );
}
