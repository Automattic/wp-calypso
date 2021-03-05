/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'calypso/state/selectors/get-raw-site';
import { hasStaticFrontPage } from 'calypso/state/sites/selectors';

/**
 * Checks if a site is using the new Full Site Editing experience
 *
 * @param {object} state  Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if the site is using Full Site Editing, otherwise false
 */
export default function isSiteUsingFullSiteEditing( state, siteId ) {
	const site = getRawSite( state, siteId );
	const isActive = get( site, 'is_fse_active', false );
	return isActive && hasStaticFrontPage( state, siteId );
}
