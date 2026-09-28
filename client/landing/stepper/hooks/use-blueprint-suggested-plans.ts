import { useQuery } from '@tanstack/react-query';
import { lookupBlueprintArchive } from 'calypso/landing/stepper/utils/blueprint-archive-import';

/**
 * The plans a blueprint suggests, for narrowing the plans step to them.
 *
 * Fetched here rather than carried over from the `blueprint` step: the plans step
 * is reached after a login redirect and, on the plain (Simple-site) import, without
 * that step ever looking the blueprint up. The lookup is a public GET, and
 * react-query dedupes it with the `blueprint` step's own call.
 *
 * `isLoading` is only true while a blueprint is actually being looked up, so a
 * caller can hold the grid until the suggestions are known and never flash the
 * wrong plans.
 */
export function useBlueprintSuggestedPlans( blueprintIdentifier: string | null | undefined ): {
	suggestedPlans: string[];
	isLoading: boolean;
} {
	const identifier = blueprintIdentifier?.trim() ?? '';

	const { data, isLoading } = useQuery( {
		queryKey: [ 'blueprint-archive-lookup', identifier ],
		queryFn: () => lookupBlueprintArchive( identifier ),
		enabled: identifier !== '',
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		meta: { persist: false },
	} );

	return {
		suggestedPlans: data?.suggestedPlans ?? [],
		isLoading: identifier !== '' && isLoading,
	};
}
