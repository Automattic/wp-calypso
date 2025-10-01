import { wpcom } from '../wpcom-fetcher';
import type { HostingDashboardSiteListParams, HostingDashboardSiteListResponse } from './types';

export async function fetchHostingDashboardSiteList(
	params: HostingDashboardSiteListParams = {}
): Promise< HostingDashboardSiteListResponse > {
	return wpcom.req.get(
		{ path: '/hosting-dashboard/site-list', apiNamespace: 'wpcom/v2' },
		{ ...params, fields: params.fields?.join( ',' ) }
	);
}
