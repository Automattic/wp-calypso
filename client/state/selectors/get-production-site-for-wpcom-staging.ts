import { AppState } from 'calypso/types';
import getRawSite from './get-raw-site';
import type { SiteDetails } from '@automattic/data-stores';

/**
 * Returns true if site is a Staging site, false otherwise.
 * @param  {Object}   state  Global state tree
 * @param  {number | null}   siteId Site ID
 * @returns { SiteDetails | null } The production site for a wpcom staging site.
 */
export default function getProductionSiteForWpcomStaging(
	state: AppState,
	siteId: number | null
): SiteDetails | null {
	if ( ! siteId ) {
		return null;
	}
	const site = getRawSite( state, siteId );
	const productionId = site?.options?.wpcom_production_blog_id ?? '';
	if ( ! productionId ) {
		return null;
	}
	return getRawSite( state, productionId );
}
