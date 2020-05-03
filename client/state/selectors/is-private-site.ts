/**
 * Internal dependencies
 */

import getRawSite from 'state/selectors/get-raw-site';
import { getSiteSettings } from 'state/site-settings/selectors';
import { AppState } from 'types';

/**
 * Returns true if the site is private
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if site is private
 */
export default function isPrivateSite( state: AppState, siteId: number ): boolean | null {
	const site = getRawSite( state, siteId );

	if ( site ) {
		return site.is_private;
	}

	const settings = getSiteSettings( state, siteId );

	if ( settings ) {
		// Site settings returns a numerical value for blog_public.
		return parseInt( settings.blog_public, 10 ) === -1;
	}

	return null;
}
