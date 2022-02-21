import getRawSite from 'calypso/state/selectors/get-raw-site';
import { SiteData } from '../ui/selectors/site-data';
import type { AppState, SiteId } from 'calypso/types';

/**
 * Returns the site category selected by the user in the DIFM Lite
 * signup flow. Returns null if the there is no selected category
 * or if the site does not exist.
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?string}        The selected site category
 */
export default function getDIFMLiteSiteCategory(
	state: AppState,
	siteId: SiteId | null
): string | null {
	if ( ! siteId ) {
		return null;
	}
	const site = getRawSite( state, siteId ) as SiteData;

	if ( ! site ) {
		return null;
	}

	return site.options?.difm_lite_site_options?.site_category ?? null;
}
