/**
 * Internal dependencies
 */
import getSite from 'state/sites/selectors/get-site';
import getSelectedSiteId from './get-selected-site-id';

/**
 * @typedef {object} SiteData
 * @property {number} ID
 * @property {string} name
 * @property {string} URL
 * @property {string} slug
 * @property {string} domain
 * @property {string} locale
 * TODO: fill this out and/or move it to a TS file
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
