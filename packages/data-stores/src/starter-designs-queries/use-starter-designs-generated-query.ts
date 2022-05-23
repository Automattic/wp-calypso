import { useQuery, UseQueryResult } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { StarterDesignsGenerated } from './types';

export function useStarterDesignsGeneratedQuery(): UseQueryResult< StarterDesignsGenerated[] > {
	return useQuery( [ 'starter-designs-generated' ], () => fetchStarterDesignsGenerated(), {
		enabled: true,
		staleTime: Infinity,
	} );
}

function fetchStarterDesignsGenerated(): Promise< StarterDesignsGenerated[] > {
	return wpcomRequest< StarterDesignsGenerated[] >( {
		apiNamespace: 'wpcom/v2',
		path: '/starter-designs/generated',
	} );
}
