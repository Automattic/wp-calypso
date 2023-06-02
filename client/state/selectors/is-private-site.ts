import getRawSite from 'calypso/state/selectors/get-raw-site';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { AppState } from 'calypso/types';

/**
 * Returns true if the site is private
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @returns {boolean} True if site is private
 */
export default function isPrivateSite( state: AppState, siteId: number ): boolean | null {
	const site = getRawSite( state, siteId );

	if ( site ) {
		return site.is_private ?? null;
	}

	const settings = getSiteSettings( state, siteId );

	if ( settings ) {
		// Site settings returns a numerical value for blog_public.
		return parseInt( String( settings.blog_public ?? 0 ), 10 ) === -1;
	}

	return null;
}
