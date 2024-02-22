import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getPatternsQueryOptions } from 'calypso/my-sites/patterns/lib/get-patterns-query-options';
import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

export function usePatterns(
	locale: string,
	category: string,
	queryOptions: Omit< UseQueryOptions< any, unknown, Pattern[] >, 'queryKey' > = {}
) {
	return useQuery< any, unknown, Pattern[] >(
		getPatternsQueryOptions( locale, category, queryOptions )
	);
}
