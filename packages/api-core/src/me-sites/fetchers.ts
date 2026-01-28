import { JOINED_SITE_FIELDS, JOINED_SITE_OPTIONS } from '../site';
import { wpcom } from '../wpcom-fetcher';
import type { Site } from '../site';

export type FetchSiteType = 'atomic' | 'jetpack' | 'wpcom' | 'jetpack-full' | 'commerce-garden';

/**
 * This option is required to ensure consumers explicitly specify which types of sites they want.
 * The `all` option means fetching all types of sites.
 */
export type FetchSiteTypes = 'all' | FetchSiteType[];

export interface FetchSitesOptions {
	source?: string;
	site_visibility: 'all' | 'visible' | 'hidden' | 'deleted';
	include_a8c_owned: boolean;
}

export interface FetchPaginatedSitesOptions extends FetchSitesOptions {
	search?: string;
	plan?: string[];
	visibility?: string[];
	sort_field?: string;
	sort_direction?: string;
	page?: number;
	per_page?: number;
}

export interface FetchPaginatedSitesResponse {
	sites: Site[];
	total: number;
}

export async function fetchSites(
	site_types: FetchSiteTypes,
	{ source, site_visibility, include_a8c_owned }: FetchSitesOptions
): Promise< Site[] > {
	const { sites } = await wpcom.req.get(
		{
			path: '/me/sites',
			apiVersion: '1.2',
		},
		{
			fields: JOINED_SITE_FIELDS,
			options: JOINED_SITE_OPTIONS,
			source,
			site_activity: 'active',
			site_visibility,
			include_a8c_owned,
			include_domain_only: false,
			filters: site_types !== 'all' ? site_types.join( ',' ) : undefined,
		}
	);
	return sites;
}

export async function fetchPaginatedSites(
	site_types: FetchSiteTypes,
	{
		source,
		site_visibility,
		include_a8c_owned,
		search,
		plan,
		visibility,
		sort_field,
		sort_direction,
		page,
		per_page,
	}: FetchPaginatedSitesOptions
): Promise< FetchPaginatedSitesResponse > {
	return await wpcom.req.get(
		{
			path: '/me/sites',
			apiVersion: '1.3',
		},
		{
			fields: JOINED_SITE_FIELDS,
			options: JOINED_SITE_OPTIONS,
			source,
			site_activity: 'active',
			site_visibility,
			include_a8c_owned,
			include_domain_only: false,
			filters: site_types !== 'all' ? site_types.join( ',' ) : undefined,
			search,
			plan,
			visibility,
			sort_field,
			sort_direction,
			page,
			per_page,
		}
	);
}
