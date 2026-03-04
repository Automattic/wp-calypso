import { wpcom } from '../wpcom-fetcher';
import type { FetchSiteTypes } from '../me-sites';
import type {
	DashboardFilters,
	DashboardSiteIssues,
	FetchDashboardSiteFiltersParams,
} from './types';

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

export async function fetchDashboardSiteIssues(): Promise< DashboardSiteIssues > {
	return wpcom.req.get( {
		path: '/dashboard/site-issues',
		apiNamespace: 'wpcom/v2',
	} );
}
