/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Checks if a site is using the core Site Editor
 *
 * @param {object} state  Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if the site is using core Site Editor, otherwise false
 */
export default function isSiteUsingCoreSiteEditor( state, siteId ) {
	const site = getRawSite( state, siteId );
	return get( site, 'is_core_site_editor_enabled', false );
}
