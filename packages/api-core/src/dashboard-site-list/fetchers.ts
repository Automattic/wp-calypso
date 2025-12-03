import { wpcom } from '../wpcom-fetcher';
import type { FetchSiteTypes } from '../me-sites';
import type {
	FetchDashboardSiteListParams,
	DashboardSiteListResponse,
	FetchDashboardSiteFiltersParams,
	DashboardFilters,
} from './types';

/**
 * Fetches the site list in a format appropriate for the multi-site dashboard.
 * Regardless of the fields requested in `params`, `blog_id` and `slug` will
 * always be included in the response. TypeScript logic is easier to deal with
 * when we know that they will be present.
 * @param site_types - Types of sites to fetch.
 * @param params - Parameters for fetching the site list.
 * @returns A promise that resolves to the dashboard site list response.
 */
export async function fetchDashboardSiteList(
	site_types: FetchSiteTypes,
	params: FetchDashboardSiteListParams = {}
): Promise< DashboardSiteListResponse > {
	const fields = new Set( params.fields ?? [] );
	fields.add( 'blog_id' );
	fields.add( 'slug' );

	return wpcom.req.get(
		{ path: '/dashboard/site-list', apiNamespace: 'wpcom/v2' },
		{
			...params,
			fields: [ ...fields ].join( ',' ),
			filters: {
				site_types: site_types !== 'all' ? site_types : undefined,
			},
		}
	);
}

export async function fetchDashboardSiteFilters(
	site_types: FetchSiteTypes,
	fields: FetchDashboardSiteFiltersParams[ 'fields' ]
): Promise< DashboardFilters > {
	return wpcom.req.get(
		{ path: '/dashboard/site-filters', apiNamespace: 'wpcom/v2' },
		{
			fields,
			site_types: site_types !== 'all' ? site_types : undefined,
		}
	);
}
