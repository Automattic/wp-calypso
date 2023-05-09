import { useQuery, UseQueryResult, QueryOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Design } from '@automattic/design-picker/src/types';

interface Options extends QueryOptions< Design, unknown > {
	enabled?: boolean;
}

export function useStarterDesignBySlug(
	slug: string,
	queryOptions: Options = {}
): UseQueryResult< Design > {
	return useQuery( [ 'starter-designs-get', slug ], () => fetchStarterDesignBySlug( slug ), {
		refetchOnMount: 'always',
		staleTime: Infinity,
		...queryOptions,
	} );
}

function fetchStarterDesignBySlug( slug: string ): Promise< Design > {
	return wpcomRequest< Design >( {
		apiNamespace: 'wpcom/v2',
		path: `/starter-designs/${ encodeURIComponent( slug ) }`,
	} );
}
