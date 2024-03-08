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
		queryFn: () => {
			return wpcom.req.get( `/ptk/patterns/${ locale }`, {
				categories: category,
				post_type: 'wp_block',
			} );
		},
		staleTime: Infinity,
		...queryOptions,
		enabled: !! category,
	};
}

export function usePatterns(
	locale: string,
	category: string,
	queryOptions: Omit< UseQueryOptions< Pattern[] >, 'queryKey' > = {}
) {
	return useQuery< Pattern[] >( getPatternsQueryOptions( locale, category, queryOptions ) );
}
