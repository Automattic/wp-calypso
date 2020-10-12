/**
 * External dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import type { DataStatus } from '@automattic/data-stores/src/domain-suggestions/constants';
import type { DomainSuggestion } from '@automattic/data-stores/src/domain-suggestions/types';
import { useDebounce } from 'use-debounce';

/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_STORE, DOMAIN_SEARCH_DEBOUNCE_INTERVAL } from '../constants';

type DomainSuggestionsResult = {
	allDomainSuggestions: DomainSuggestion[] | undefined;
	errorMessage: string | null;
	state: DataStatus;
	retryRequest: () => void;
};

export function useDomainSuggestions(
	searchTerm = '',
	quantity: number,
	domainCategory?: string,
	locale = 'en'
): DomainSuggestionsResult | undefined {
	const [ domainSearch ] = useDebounce( searchTerm, DOMAIN_SEARCH_DEBOUNCE_INTERVAL );

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	// Missing types for invalidateResolutionForStoreSelector
	// (see packages/data/src/namespace-store/metadata/actions.js#L57)
	const { invalidateResolutionForStoreSelector } = useDispatch( DOMAIN_SUGGESTIONS_STORE );

	return useSelect(
		( select ) => {
			if ( ! domainSearch || domainSearch.length < 2 ) {
				return;
			}
			const { getDomainSuggestions, getDomainState, getDomainErrorMessage } = select(
				DOMAIN_SUGGESTIONS_STORE
			);

			const retryRequest = (): void => {
				invalidateResolutionForStoreSelector( '__internalGetDomainSuggestions' );
			};

			const allDomainSuggestions = getDomainSuggestions( domainSearch, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: true,
				include_dotblogsubdomain: false,
				quantity: quantity + 1, // increment the count to add the free domain
				locale,
				category_slug: domainCategory,
			} );

			const state = getDomainState();

			const errorMessage = getDomainErrorMessage();

			return { allDomainSuggestions, state, errorMessage, retryRequest };
		},
		[ domainSearch, domainCategory, quantity ]
	);
}
