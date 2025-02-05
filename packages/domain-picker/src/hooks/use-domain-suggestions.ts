import { DomainSuggestions } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
import { useDebounce } from 'use-debounce';
import type { DataStatus } from '@automattic/data-stores/src/domain-suggestions/constants';

const DOMAIN_QUERY_MINIMUM_LENGTH = 2;

/**
 * Debounce our input + HTTP dependent select changes
 *
 * Rapidly changing input generates excessive HTTP requests.
 * It also leads to jarring UI changes.
 * @see https://stackoverflow.com/a/44755058/1432801
 */
const DOMAIN_SEARCH_DEBOUNCE_INTERVAL = 300;

type DomainSuggestionsResult = {
	allDomainSuggestions: DomainSuggestions.DomainSuggestion[] | undefined;
	errorMessage: string | null;
	state: DataStatus;
	retryRequest: () => void;
};

export function useDomainSuggestions(
	searchTerm = '',
	quantity: number,
	domainCategory?: string,
	locale = 'en',
	extraOptions = {}
): DomainSuggestionsResult | undefined {
	const [ domainSearch ] = useDebounce( searchTerm, DOMAIN_SEARCH_DEBOUNCE_INTERVAL );
	const { invalidateResolutionForStoreSelector } = useDispatch(
		DomainSuggestions.store
	) as unknown as {
		invalidateResolutionForStoreSelector: ( selectorName: string ) => void;
	};

	const retryRequest = (): void => {
		invalidateResolutionForStoreSelector( '__internalGetDomainSuggestions' );
	};

	const domainSuggestions = useSelect(
		( select ) => {
			if ( ! domainSearch || domainSearch.length < DOMAIN_QUERY_MINIMUM_LENGTH ) {
				return;
			}
			const { getDomainSuggestions, getDomainState, getDomainErrorMessage } = select(
				DomainSuggestions.store
			);

			const allDomainSuggestions = getDomainSuggestions( domainSearch, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: true,
				include_dotblogsubdomain: false,
				quantity: quantity + 1, // increment the count to add the free domain
				locale,
				category_slug: domainCategory,
				...extraOptions,
			} );

			const state = getDomainState();

			const errorMessage = getDomainErrorMessage();

			return { allDomainSuggestions, state, errorMessage };
		},
		[ domainSearch, domainCategory, quantity, locale, extraOptions ]
	);

	if ( ! domainSuggestions ) {
		return;
	}

	return {
		...domainSuggestions,
		retryRequest,
	};
}
