import { wpcom } from '../wpcom-fetcher';
import type {
	FetchDashboardSiteListParams,
	DashboardSiteListResponse,
	DashboardFilters,
} from './types';

export async function fetchDashboardSiteList(
	params: FetchDashboardSiteListParams = {}
): Promise< DashboardSiteListResponse > {
	return wpcom.req.get(
		{ path: '/dashboard/site-list', apiNamespace: 'wpcom/v2' },
		{ ...params, fields: params.fields?.join( ',' ) }
	);
}

export async function fetchDashboardSiteFilters(
	field: keyof DashboardFilters
): Promise< DashboardFilters > {
	return wpcom.req.get(
		{ path: '/dashboard/site-filters', apiNamespace: 'wpcom/v2' },
		{ fields: field }
	);
}
