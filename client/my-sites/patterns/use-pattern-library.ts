import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

export function usePatternLibrary(
	locale: string,
	queryOptions: Omit< UseQueryOptions< any, unknown, Pattern[] >, 'queryKey' > = {}
) {
	return useQuery< any, unknown, Pattern[] >( {
		queryKey: [ 'patterns', 'library', locale ],
		queryFn: () => {
			return wpcomRequest( {
				path: `/ptk/patterns/${ locale }`,
				method: 'GET',
				apiVersion: '1.1',
				query: new URLSearchParams( {
					categories: 'intro',
					per_page: '4',
					post_type: 'wp_block',
				} ).toString(),
			} );
		},
		...queryOptions,
		staleTime: Infinity,
	} );
}
