import { DomainSuggestions } from '@automattic/data-stores';
import { DataResponse } from 'calypso/my-sites/plan-features-2023-grid/types';

export function useGetDotcomDomainSuggestion( {
	query,
	locale,
}: {
	query: string;
	locale?: string;
} ): {
	suggestionResponse: DataResponse< DomainSuggestions.DomainSuggestion >;
	invalidateDomainSuggestionCache: () => void;
} {
	const {
		data: wordPressSubdomainSuggestions,
		isInitialLoading,
		isError,
		invalidateCache: invalidateDomainSuggestionCache,
	} = DomainSuggestions.useGetSingleCustomDotComDomainSuggestion( query, locale );

	return {
		suggestionResponse: {
			isLoading: isInitialLoading,
			result: ( ! isError && wordPressSubdomainSuggestions?.[ 0 ] ) || undefined,
		},
		invalidateDomainSuggestionCache,
	};
}
