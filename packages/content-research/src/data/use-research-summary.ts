import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { ResearchResult, ResearchSummary } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
	method: string;
	data: Record< string, unknown >;
}

export function useResearchSummary( topic: string, results: ResearchResult[], trigger: number ) {
	return useQuery< ResearchSummary >( {
		queryKey: [ 'content-research-summary', topic, results, trigger ],
		queryFn: () => {
			if ( canAccessWpcomApis() ) {
				return wpcomRequest< ResearchSummary >( {
					path: '/content-research/summarize',
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					body: { topic, results },
				} );
			}
			return apiFetch< ResearchSummary >( {
				global: true,
				path: '/content-research/summarize',
				method: 'POST',
				data: { topic, results },
			} as APIFetchOptions );
		},
		enabled: trigger > 0 && results.length > 0,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	} );
}
