import { wpcom } from '../wpcom-fetcher';
import type { DashboardSiteListParams, DashboardSiteListResponse } from './types';

export async function fetchDashboardSiteList(
	params: DashboardSiteListParams = {}
): Promise< DashboardSiteListResponse > {
	return wpcom.req.get(
		{ path: '/dashboard/site-list', apiNamespace: 'wpcom/v2' },
		{ ...params, fields: params.fields?.join( ',' ) }
	);
}
