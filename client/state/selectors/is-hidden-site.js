/** @format */

/**
 * Internal dependencies
 */

import { getSiteSettings } from 'client/state/site-settings/selectors';

/**
 * Returns true if the site is hidden
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @return {Boolean} True if site is hidden
 */
export default function isHiddenSite( state, siteId ) {
	const settings = getSiteSettings( state, siteId );

	if ( ! settings ) {
		return null;
	}

	// Site settings returns a numerical value for blog_public.
	return parseInt( settings.blog_public, 10 ) === 0;
}
