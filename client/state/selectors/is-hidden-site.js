/**
 * Internal dependencies
 */

import { getSiteSettings } from 'calypso/state/site-settings/selectors';

/**
 * Returns true if the site is hidden
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if site is hidden
 */
export default function isHiddenSite( state, siteId ) {
	const settings = getSiteSettings( state, siteId );

	if ( ! settings ) {
		return null;
	}

	// Site settings returns a numerical value for blog_public.
	return parseInt( settings.blog_public, 10 ) === 0;
}
