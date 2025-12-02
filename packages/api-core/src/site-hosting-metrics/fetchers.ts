import { wpcom } from '../wpcom-fetcher';
import type { SiteHostingMetrics, SiteHostingMetricsParams } from './types';

export async function fetchSiteHostingMetrics(
	siteId: number,
	params: SiteHostingMetricsParams
): Promise< SiteHostingMetrics > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/hosting/metrics`,
			apiNamespace: 'wpcom/v2',
		},
		params
	);
}
