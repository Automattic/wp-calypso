import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { ResearchResponse, Source } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
	method: string;
}

function buildQuery( topic: string, sources: Source[] ) {
	const params = new URLSearchParams( { topic } );
	sources.forEach( ( source ) => params.append( 'sources[]', source ) );
	return params.toString();
}

export function useContentResearch( topic: string, sources: Source[] ) {
	return useQuery< ResearchResponse >( {
		queryKey: [ 'content-research', topic, [ ...sources ].sort() ],
		queryFn: () => {
			const query = buildQuery( topic, sources );
			if ( canAccessWpcomApis() ) {
				return wpcomRequest< ResearchResponse >( {
					path: '/content-research/search',
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					query,
				} );
			}
			return apiFetch< ResearchResponse >( {
				global: true,
				path: `/content-research/search?${ query }`,
				method: 'GET',
			} as APIFetchOptions );
		},
		enabled: !! topic && sources.length > 0,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	} );
}
