import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { Pattern } from 'calypso/my-sites/patterns/types';

export function getPatternsQueryOptions(
	locale: string,
	category: string,
	queryOptions: Omit< UseQueryOptions< Pattern[] >, 'queryKey' > = {}
) {
	return {
		queryKey: [ 'pattern-library', 'patterns', locale, category ],
		async queryFn() {
			return wpcom.req.get( `/ptk/patterns/${ locale }`, {
				categories: category,
				post_type: 'wp_block',
			} );
		},
		staleTime: 5 * 60 * 1000,
		...queryOptions,
	};
}

export function usePatterns(
	locale: string,
	category: string,
	queryOptions: Omit< UseQueryOptions< Pattern[] >, 'queryKey' > = {}
) {
	return useQuery< Pattern[] >( getPatternsQueryOptions( locale, category, queryOptions ) );
}
