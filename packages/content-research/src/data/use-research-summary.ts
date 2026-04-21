import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import type { ResearchResult, ResearchSummary } from '../types';

export function useResearchSummary( topic: string, results: ResearchResult[] ) {
	return useQuery< ResearchSummary >( {
		// eslint-disable-next-line @tanstack/query/exhaustive-deps -- results intentionally excluded; query is only triggered manually via refetch
		queryKey: [ 'content-research-summary', topic ],
		queryFn: () =>
			apiFetch< ResearchSummary >( {
				path: '/wpcom/v2/content-research/summarize',
				method: 'POST',
				data: { topic, results },
			} ),
		enabled: false, // Only triggered manually via refetch
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	} );
}
