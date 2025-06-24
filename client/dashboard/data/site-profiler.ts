import wpcom from 'calypso/lib/wp';

export interface BasicMetricsData {
	token?: string;
}

export interface PerformanceReport {
	overall_score: number;
}

export interface UrlPerformanceInsights {
	pagespeed: {
		status: string;
		mobile: PerformanceReport | string;
		desktop: PerformanceReport | string;
	};
	wpscan: {
		status: string;
	};
}

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
