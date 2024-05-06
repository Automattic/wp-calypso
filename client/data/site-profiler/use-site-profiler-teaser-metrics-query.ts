import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type SiteProfilerTeaserMetricsAPIResponse = {
	advanced: [];
	basic: { cls: string; fid: number; lcp: number; fcp: number; ttfb: number; inp: number };
};

export function useSiteProfilerTeaserMetricsQuery( siteURL: string ) {
	return useQuery< SiteProfilerTeaserMetricsAPIResponse >( {
		queryKey: [ 'teaser-metrics-', siteURL ],
		queryFn: () => {
			const path = `/site-profiler/metrics/basic`;
			return wpcom.req.get(
				{ path, apiNamespace: 'wpcom/v2' },
				{
					url: siteURL,
				}
			);
		},
	} );
}
