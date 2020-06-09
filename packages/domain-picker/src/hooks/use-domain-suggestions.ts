/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useDebounce } from 'use-debounce';

/**
 * Internal dependencies
 */
import {
	DOMAIN_SUGGESTION_VENDOR,
	PAID_DOMAINS_TO_SHOW_WITHOUT_CATEGORIES_MODE,
	DOMAIN_SUGGESTIONS_STORE,
	DOMAIN_SEARCH_DEBOUNCE_INTERVAL,
} from '../constants';

export function useDomainSuggestions(
	searchTerm = '',
	domainCategory?: string,
	locale = 'en',
	quantity = PAID_DOMAINS_TO_SHOW_WITHOUT_CATEGORIES_MODE
) {
	const [ domainSearch ] = useDebounce( searchTerm, DOMAIN_SEARCH_DEBOUNCE_INTERVAL );

	return useSelect(
		( select ) => {
			if ( ! domainSearch ) {
				return;
			}
			return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( domainSearch, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: true,
				include_dotblogsubdomain: false,
				quantity: quantity + 1, // increment the count to add the free domain
				locale,
				vendor: DOMAIN_SUGGESTION_VENDOR,
				category_slug: domainCategory,
			} );
		},
		[ domainSearch, domainCategory, quantity ]
	);
}
