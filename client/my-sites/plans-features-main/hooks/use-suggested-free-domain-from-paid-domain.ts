import { DomainSuggestions } from '@automattic/data-stores';

export function useSuggestedFreeDomainFromPaidDomain( paidDomainName?: string ): {
	isLoadingSuggestedFreeDomain: boolean;
	wpcomFreeDomainSuggestion?: DomainSuggestions.DomainSuggestion;
	invalidateDomainSuggestionCache: () => void;
} {
	const {
		data: wordPressSubdomainSuggestions,
		isInitialLoading,
		isError,
		invalidateCache: invalidateDomainSuggestionCache,
	} = DomainSuggestions.useGetWordPressSubdomain( paidDomainName || '' );

	return {
		isLoadingSuggestedFreeDomain: isInitialLoading,
		wpcomFreeDomainSuggestion: ( ! isError && wordPressSubdomainSuggestions?.[ 0 ] ) || undefined,
		invalidateDomainSuggestionCache,
	};
}

export default useSuggestedFreeDomainFromPaidDomain;
