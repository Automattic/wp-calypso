/**
 * Internal dependencies
 */
import { getRawSite } from 'state/sites/selectors';
import { getSiteSettings } from 'state/site-settings/selectors';

/**
 * Returns true if the site is private
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @return {Boolean} True if site is private
 */
export default function isPrivateSite( state, siteId ) {
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
