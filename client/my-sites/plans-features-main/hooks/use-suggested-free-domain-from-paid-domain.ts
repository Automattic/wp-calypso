import { DomainSuggestions } from '@automattic/data-stores';
import type { DataResponse } from 'calypso/my-sites/plan-features-2023-grid/types';

export function useGetFreeSubdomainSuggestion( query: string ): {
	wpcomFreeDomainSuggestion: DataResponse< DomainSuggestions.DomainSuggestion >;
	invalidateDomainSuggestionCache: () => void;
} {
	const {
		data: wordPressSubdomainSuggestions,
		isInitialLoading,
		isError,
		invalidateCache: invalidateDomainSuggestionCache,
	} = DomainSuggestions.useGetWordPressSubdomain( query );

	return {
		wpcomFreeDomainSuggestion: {
			isLoading: isInitialLoading,
			result: ( ! isError && wordPressSubdomainSuggestions?.[ 0 ] ) || undefined,
		},
		invalidateDomainSuggestionCache,
	};
}

export default useGetFreeSubdomainSuggestion;
