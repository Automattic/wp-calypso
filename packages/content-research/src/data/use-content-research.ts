import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { ResearchResponse } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
	method: string;
	data: Record< string, unknown >;
}

export function useContentResearch( topic: string ) {
	return useQuery< ResearchResponse >( {
		queryKey: [ 'content-research', topic ],
		queryFn: () => {
			if ( canAccessWpcomApis() ) {
				return wpcomRequest< ResearchResponse >( {
					path: '/content-research/search',
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					body: { topic },
				} );
			}
			return apiFetch< ResearchResponse >( {
				global: true,
				path: '/content-research/search',
				method: 'POST',
				data: { topic },
			} as APIFetchOptions );
		},
		enabled: !! topic,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	} );
}
