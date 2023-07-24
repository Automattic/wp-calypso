import { DomainSuggestions } from '@automattic/data-stores';
import type { SingleFreeDomainSuggestion } from 'calypso/my-sites/plan-features-2023-grid/types';

export function useSuggestedFreeDomainFromPaidDomain( paidDomainName?: string ): {
	wpcomFreeDomainSuggestion: SingleFreeDomainSuggestion;
	invalidateDomainSuggestionCache: () => void;
} {
	const {
		data: wordPressSubdomainSuggestions,
		isInitialLoading,
		isError,
		invalidateCache: invalidateDomainSuggestionCache,
	} = DomainSuggestions.useGetWordPressSubdomain( paidDomainName || '' );

	return {
		wpcomFreeDomainSuggestion: {
			isLoading: isInitialLoading,
			entry: ( ! isError && wordPressSubdomainSuggestions?.[ 0 ] ) || undefined,
		},
		invalidateDomainSuggestionCache,
	};
}

export default useSuggestedFreeDomainFromPaidDomain;
