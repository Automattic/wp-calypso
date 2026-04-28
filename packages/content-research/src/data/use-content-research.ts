import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { buildQueryString } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { ResearchResponse } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export function useContentResearch( topic: string ) {
	return useQuery< ResearchResponse >( {
		queryKey: [ 'content-research', topic ],
		queryFn: () => {
			const queryString = buildQueryString( { topic } );
			if ( canAccessWpcomApis() ) {
				return wpcomRequest< ResearchResponse >( {
					path: `/content-research/search?${ queryString }`,
					apiNamespace: 'wpcom/v2',
				} );
			}
			return apiFetch< ResearchResponse >( {
				global: true,
				path: `/content-research/search?${ queryString }`,
			} as APIFetchOptions );
		},
		enabled: !! topic,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	} );
}
