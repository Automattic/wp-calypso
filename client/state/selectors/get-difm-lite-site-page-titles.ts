import getRawSite from 'calypso/state/selectors/get-raw-site';
import type { PageId } from 'calypso/signup/difm/constants';
import type { AppState, SiteId } from 'calypso/types';

/**
 * Returns the pages selected by the user in the DIFM Lite
 * signup flow.  Returns null if the the data is no available
 *
 * @param  {Object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {Array}   The selected site category
 */
export default function getDIFMLiteSitePageTitles(
	state: AppState,
	siteId: SiteId | null
): PageId[] | null {
	if ( ! siteId ) {
		return null;
	}
	const site = getRawSite( state, siteId );

	if ( ! site ) {
		return null;
	}

	const pageIds = site.options?.difm_lite_site_options?.selected_page_titles as PageId[];
	return pageIds ?? null;
}
