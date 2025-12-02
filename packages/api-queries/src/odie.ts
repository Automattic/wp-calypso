import { fetchOdieAssistantPerformanceProfiler } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { PerformanceMetricAudit } from '@automattic/api-core';

export const odieAssistantPerformanceProfilerQuery = ( {
	insight,
	hash,
	isWpcom,
	locale,
	device,
}: {
	insight: PerformanceMetricAudit;
	hash: string;
	isWpcom: boolean;
	locale?: string;
	device?: string;
} ) => {
	return queryOptions( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: [ 'support', 'chat', hash, insight.title, isWpcom, locale, device ],
		queryFn: () =>
			fetchOdieAssistantPerformanceProfiler( {
				hash,
				insight,
				isWpcom,
				locale,
				device,
			} ),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
	} );
};
