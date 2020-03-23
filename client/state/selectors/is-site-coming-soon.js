/**
 * Internal dependencies
 */

import getRawSite from 'state/selectors/get-raw-site';
import { getSiteSettings } from 'state/site-settings/selectors';
import isPrivateSite from 'state/selectors/is-private-site';

/**
 * Returns true if the site is coming_soon
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if site is coming_soon
 */
export default function isSiteComingSoon( state, siteId ) {
	if ( ! isPrivateSite( state, siteId ) ) {
		return false;
	}

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
