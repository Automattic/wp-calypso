import { wpcom } from '../wpcom-fetcher';
import type { BasicMetricsData, PerformanceProfilerPage, UrlPerformanceInsights } from './types';

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

export async function fetchPerformanceInsights(
	url: string,
	token: string
): Promise< UrlPerformanceInsights > {
	return wpcom.req.get(
		{
			path: '/site-profiler/metrics/advanced/insights',
			apiNamespace: 'wpcom/v2',
		},
		{ url, advance: '1', hash: token }
	);
}

export const fetchPerformanceProfilerPages = async (
	siteIdOrSlug: string
): Promise< PerformanceProfilerPage[] > => {
	return wpcom.req.get( {
		path: `/sites/${ siteIdOrSlug }/site-profiler/pages`,
		apiNamespace: 'wpcom/v2',
	} );
};
