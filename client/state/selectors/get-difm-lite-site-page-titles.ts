import getRawSite from 'calypso/state/selectors/get-raw-site';
import { SiteData } from '../ui/selectors/site-data';
import type { AppState, SiteId } from 'calypso/types';

/**
 * Returns the pages selected by the user in the DIFM Lite
 * signup flow.  Returns null if the the data is no available
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {Array}   The selected site category
 */
export default function getDIFMLiteSitePageTitles(
	state: AppState,
	siteId: SiteId | null
): string[] | null {
	if ( ! siteId ) {
		return null;
	}
	const site = getRawSite( state, siteId ) as SiteData;

	if ( ! site ) {
		return null;
	}

	return site.options?.difm_lite_site_options?.selected_page_titles ?? null;
}
