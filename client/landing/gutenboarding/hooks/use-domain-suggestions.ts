/**
 * External dependencies
 */
import { useDebounce } from 'use-debounce';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_STORE } from '../stores/domain-suggestions';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { PAID_DOMAINS_TO_SHOW, selectorDebounce } from '../constants';
import { getSuggestionsVendor } from 'lib/domains/suggestions';

const DOMAIN_SUGGESTION_VENDOR = getSuggestionsVendor( true );

// @TODO: remove this once use-on-login hook is using the hook from packages
export function useDomainSuggestions( {
	searchOverride = '',
	locale = 'en',
	quantity = PAID_DOMAINS_TO_SHOW,
} ) {
	const { domainCategory } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const domainSearch = useSelect( ( select ) => select( ONBOARD_STORE ).getDomainSearch() );

	const prioritisedSearch = searchOverride.trim() || domainSearch;

	const [ searchTerm ] = useDebounce( prioritisedSearch, selectorDebounce );

	return useSelect(
		( select ) => {
			if ( ! searchTerm ) {
				return;
			}
			return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( searchTerm, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: true,
				include_dotblogsubdomain: false,
				quantity,
				locale,
				vendor: DOMAIN_SUGGESTION_VENDOR,
				category_slug: domainCategory,
			} );
		},
		[ searchTerm, domainCategory, quantity ]
	);
}
