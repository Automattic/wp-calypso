/**
 * Internal dependencies
 */

import getRawSite from 'calypso/state/selectors/get-raw-site';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';

/**
 * Returns true if the site is coming_soon
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if site is coming_soon
 */
export default function isSiteComingSoon( state, siteId ) {
	const site = getRawSite( state, siteId );

	if ( site ) {
		return site.is_coming_soon;
	}

	const settings = getSiteSettings( state, siteId );

	if ( settings ) {
		// Site settings returns a numerical value for wpcom_coming_soon.
		return parseInt( settings.wpcom_coming_soon, 10 ) === 1;
	}

	return false;
}
