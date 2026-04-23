import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import type { ResearchResult, ResearchSummary } from '../types';

export function useResearchSummary( topic: string, results: ResearchResult[], trigger: number ) {
	return useQuery< ResearchSummary >( {
		queryKey: [ 'content-research-summary', topic, trigger ],
		queryFn: () =>
			apiFetch< ResearchSummary >( {
				path: '/wpcom/v2/content-research/summarize',
				method: 'POST',
				data: { topic, results },
			} ),
		enabled: trigger > 0 && results.length > 0,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	} );
}
