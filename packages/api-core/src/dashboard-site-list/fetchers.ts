import { wpcom } from '../wpcom-fetcher';
import type { FetchDashboardSiteListParams, DashboardSiteListResponse } from './types';

export async function fetchDashboardSiteList(
	params: FetchDashboardSiteListParams = {}
): Promise< DashboardSiteListResponse > {
	return wpcom.req.get(
		{ path: '/dashboard/site-list', apiNamespace: 'wpcom/v2' },
		{ ...params, fields: params.fields?.join( ',' ) }
	);
}
