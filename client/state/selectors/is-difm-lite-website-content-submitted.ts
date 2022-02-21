import getRawSite from 'calypso/state/selectors/get-raw-site';
import { SiteData } from '../ui/selectors/site-data';
import type { AppState, SiteId } from 'calypso/types';

/**
 * Returns if the DIFM Lite Website Content form has been submitted.
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {boolean}        true if submitted, false otherwise
 */
export default function isDIFMLiteWebsiteContentSubmitted(
	state: AppState,
	siteId: SiteId | null
): boolean {
	if ( ! siteId ) {
		return false;
	}

	const site = getRawSite( state, siteId ) as SiteData;

	if ( ! site ) {
		return false;
	}

	return site.options?.difm_lite_site_options?.is_website_content_submitted ?? false;
}
