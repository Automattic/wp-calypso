import { wpcom } from '../wpcom-fetcher';
import type { BasicMetricsData, SitePerformanceInsights } from './types';

export async function fetchBasicMetrics( url: string ): Promise< BasicMetricsData > {
	return wpcom.req.get(
		{
			path: '/site-profiler/metrics/basic',
			apiNamespace: 'wpcom/v2',
		},
		// Important: advance=1 is needed to get the `token` and request advanced metrics.
		{ url, advance: '1' }
	);
}

export async function fetchSitePerformanceInsights(
	url: string,
	token: string
): Promise< SitePerformanceInsights > {
	return wpcom.req.get(
		{
			path: '/site-profiler/metrics/advanced/insights',
			apiNamespace: 'wpcom/v2',
		},
		{ url, advance: '1', hash: token }
	);
}
