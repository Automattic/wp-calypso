import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import type { ResearchResponse } from '../types';

export function useContentResearch( topic: string ) {
	return useQuery< ResearchResponse >( {
		queryKey: [ 'content-research', topic ],
		queryFn: () =>
			apiFetch< ResearchResponse >( {
				path: '/wpcom/v2/content-research/search',
				method: 'POST',
				data: { topic },
			} ),
		enabled: !! topic,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	} );
}
