import { useQuery } from '@tanstack/react-query';
import { lookupBlueprintArchive } from 'calypso/landing/stepper/utils/blueprint-archive-import';

/**
 * A blueprint's display name (e.g. "Punk"), for naming it to the customer instead of its slug or
 * the address of the site it builds on.
 *
 * Shares the lookup, and its cache entry, with useBlueprintSuggestedPlans(): the same public GET
 * answers both.
 *
 * `isLoading` is only true while a blueprint is actually being looked up, so a caller can hold
 * its copy until the name is known rather than flash a fallback.
 * @param blueprintIdentifier The blueprint post ID or slug; empty for none.
 * @returns The title ('' when there is none, or no blueprint) and whether it is still loading.
 */
export function useBlueprintTitle( blueprintIdentifier: string | null | undefined ): {
	title: string;
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
		title: data?.title ?? '',
		isLoading: identifier !== '' && isLoading,
	};
}
