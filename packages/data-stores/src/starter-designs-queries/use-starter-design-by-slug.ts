import { useQuery, QueryOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Design } from '@automattic/design-picker/src/types';

interface Options extends QueryOptions< Design, unknown > {
	enabled?: boolean;
	select?: ( response: Design ) => Design;
}

export function useStarterDesignBySlug( slug: string, queryOptions: Options = {} ) {
	return useQuery( {
		queryKey: [ 'starter-designs-get', slug ],
		queryFn: () => fetchStarterDesignBySlug( slug ),
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
