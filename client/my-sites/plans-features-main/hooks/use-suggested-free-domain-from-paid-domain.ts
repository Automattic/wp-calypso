import { DomainSuggestions } from '@automattic/data-stores';

function useSuggestedFreeDomainFromPaidDomain( paidDomainName?: string ): {
	isLoadingSuggestedFreeDomain: boolean;
	wpcomFreeDomainSuggestion?: DomainSuggestions.DomainSuggestion;
	invalidateDomainSuggestionCache: () => void;
} {
	const {
		data: wordPressSubdomainSuggestions,
		isInitialLoading,
		isError,
	} = DomainSuggestions.useGetWordPressSubdomain( paidDomainName || '' );

	return {
		isLoadingSuggestedFreeDomain: isInitialLoading,
		wpcomFreeDomainSuggestion: ( ! isError && wordPressSubdomainSuggestions?.[ 0 ] ) || undefined,
		invalidateDomainSuggestionCache: () =>
			paidDomainName && DomainSuggestions.invalidateCache( paidDomainName ),
	};
}

export default useSuggestedFreeDomainFromPaidDomain;
