/**
 * Internal dependencies
 */

import getRawSite from 'calypso/state/selectors/get-raw-site';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { getSiteOption } from 'calypso/state/sites/selectors';

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

/**
 * Determines if a site has been created in public coming soon mode by checking for the `wpcom_public_coming_soon_site` option.
 * We add this option so we can distinguish sites created in public coming soon (v2) and private by default coming soon (v1) modes.
 * We'll gradually phase out v1 but we want to be able to show different UIs to each version until we do.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} true if the site is created in public coming soon mode
 */
export function isSiteCreatedInPublicComingSoonMode( state, siteId ) {
	const publicComingSoon = getSiteOption( state, siteId, 'wpcom_public_coming_soon_site' );
	return parseInt( publicComingSoon, 10 ) === 1;
}
