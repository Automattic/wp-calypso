import { DomainSuggestions } from '@automattic/data-stores';
import type { SingleFreeDomainSuggestion } from 'calypso/my-sites/plan-features-2023-grid/types';

export function useGetDotcomDomainSuggestion( {
	query,
	locale,
}: {
	query: string;
	locale?: string;
} ): {
	suggestion: SingleFreeDomainSuggestion;
	invalidateDomainSuggestionCache: () => void;
} {
	const {
		data: wordPressSubdomainSuggestions,
		isInitialLoading,
		isError,
		invalidateCache: invalidateDomainSuggestionCache,
	} = DomainSuggestions.useGetSingleCustomDotComDomainSuggestion( query, locale );

	return {
		suggestion: {
			isLoading: isInitialLoading,
			entry: ( ! isError && wordPressSubdomainSuggestions?.[ 0 ] ) || undefined,
		},
		invalidateDomainSuggestionCache,
	};
}
