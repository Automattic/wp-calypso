import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

export function getPatternsQueryOptions(
	locale: string,
	category: string,
	queryOptions: Omit< UseQueryOptions< Pattern[] >, 'queryKey' > = {}
) {
	return {
		queryKey: [ 'patterns', 'library', locale, category ],
		queryFn: () => {
			return wpcom.req.get( `/ptk/patterns/${ locale }`, {
				categories: category,
				post_type: 'wp_block',
			} );
		},
		...queryOptions,
		staleTime: Infinity,
	};
}

export function usePatterns(
	locale: string,
	category: string,
	queryOptions: Omit< UseQueryOptions< Pattern[] >, 'queryKey' > = {}
) {
	return useQuery< Pattern[] >( getPatternsQueryOptions( locale, category, queryOptions ) );
}
