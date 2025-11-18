import { wpcom } from '../wpcom-fetcher';
import type { FetchSiteTypes } from '../me-sites';
import type {
	FetchDashboardSiteListParams,
	DashboardSiteListResponse,
	FetchDashboardSiteFiltersParams,
	DashboardFilters,
} from './types';

export async function fetchDashboardSiteList(
	siteTypes: FetchSiteTypes,
	{ fields, ...params }: FetchDashboardSiteListParams = {}
): Promise< DashboardSiteListResponse > {
	return wpcom.req.get(
		{ path: '/dashboard/site-list', apiNamespace: 'wpcom/v2' },
		{
			...params,
			fields: fields?.join( ',' ),
			filters: {
				site_types: siteTypes !== 'all' ? siteTypes : undefined,
			},
		}
	);
}

export async function fetchDashboardSiteFilters(
	siteTypes: FetchSiteTypes,
	fields: FetchDashboardSiteFiltersParams[ 'fields' ]
): Promise< DashboardFilters > {
	return wpcom.req.get(
		{ path: '/dashboard/site-filters', apiNamespace: 'wpcom/v2' },
		{
			fields,
			site_types: siteTypes !== 'all' ? siteTypes : undefined,
		}
	);
}
