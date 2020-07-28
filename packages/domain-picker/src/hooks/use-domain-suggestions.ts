/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useDebounce } from 'use-debounce';

/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_STORE, DOMAIN_SEARCH_DEBOUNCE_INTERVAL } from '../constants';

export function useDomainSuggestions(
	searchTerm = '',
	quantity: number,
	domainCategory?: string,
	locale = 'en'
) {
	const [ domainSearch ] = useDebounce( searchTerm, DOMAIN_SEARCH_DEBOUNCE_INTERVAL );

	return useSelect(
		( select ) => {
			if ( ! domainSearch || domainSearch.length < 2 ) {
				return;
			}
			return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( domainSearch, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: true,
				include_dotblogsubdomain: false,
				quantity: quantity + 1, // increment the count to add the free domain
				locale,
				category_slug: domainCategory,
			} );
		},
		[ domainSearch, domainCategory, quantity ]
	);
}
