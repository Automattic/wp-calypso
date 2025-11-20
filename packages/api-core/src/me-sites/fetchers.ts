import { JOINED_SITE_FIELDS, JOINED_SITE_OPTIONS } from '../site';
import { wpcom } from '../wpcom-fetcher';
import type { Site } from '../site';

type FetchSitesFilter = 'atomic' | 'jetpack' | 'wpcom' | 'jetpack-full' | 'commerce-garden';

/**
 * This option is required to ensure consumers explicitly specify which types of sites they want.
 * The `all` option means fetching all types of sites.
 */
export type FetchSitesFilters = 'all' | FetchSitesFilter[];

export interface FetchSitesOptions {
	include_a8c_owned: boolean;
	site_visibility: 'all' | 'visible' | 'hidden' | 'deleted';
}

export async function fetchSites(
	site_filters: FetchSitesFilters,
	{ include_a8c_owned, site_visibility }: FetchSitesOptions
): Promise< Site[] > {
	const { sites } = await wpcom.req.get(
		{
			path: '/me/sites',
			apiVersion: '1.2',
		},
		{
			include_a8c_owned,
			include_domain_only: false,
			site_activity: 'active',
			site_visibility,
			fields: JOINED_SITE_FIELDS,
			options: JOINED_SITE_OPTIONS,
			filters: site_filters !== 'all' ? site_filters.join( ',' ) : undefined,
		}
	);
	return sites;
}
