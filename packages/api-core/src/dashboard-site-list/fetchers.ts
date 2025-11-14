import { wpcom } from '../wpcom-fetcher';
import type { FetchSitesFilters } from '../me-sites';
import type {
	FetchDashboardSiteListParams,
	DashboardSiteListResponse,
	FetchDashboardSiteFiltersParams,
	DashboardFilters,
} from './types';

export async function fetchDashboardSiteList(
	siteTypeFilters: FetchSitesFilters,
	{ fields, ...params }: FetchDashboardSiteListParams = {}
): Promise< DashboardSiteListResponse > {
	return wpcom.req.get(
		{ path: '/dashboard/site-list', apiNamespace: 'wpcom/v2' },
		{
			...params,
			fields: fields?.join( ',' ),
			filters: {
				site_type_filters: siteTypeFilters !== 'all' ? siteTypeFilters : undefined,
			},
		}
	);
}

export async function fetchDashboardSiteFilters(
	siteTypeFilters: FetchSitesFilters,
	fields: FetchDashboardSiteFiltersParams[ 'fields' ]
): Promise< DashboardFilters > {
	return wpcom.req.get(
		{ path: '/dashboard/site-filters', apiNamespace: 'wpcom/v2' },
		{
			fields,
			site_type_filters: siteTypeFilters !== 'all' ? siteTypeFilters : undefined,
		}
	);
}
