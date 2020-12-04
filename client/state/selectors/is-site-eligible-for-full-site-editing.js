/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Checks if a site is eligible for the Full Site Editing experience
 *
 * @param {object} state  Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if the site is eligible for Full Site Editing, otherwise false
 */
export default function isSiteEligibleForFullSiteEditing( state, siteId ) {
	const site = getRawSite( state, siteId );
	return get( site, 'is_fse_eligible', false );
}
