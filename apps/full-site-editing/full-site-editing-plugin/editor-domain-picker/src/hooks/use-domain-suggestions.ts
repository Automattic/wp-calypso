/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_STORE } from '../stores';

export const DOMAIN_SUGGESTION_VENDOR = 'variation4_front';
const PAID_DOMAINS_TO_SHOW = 10;

export function useDomainSuggestions(
	searchTerm: string,
	domainCategory,
	locale = 'en',
	quantity = PAID_DOMAINS_TO_SHOW
) {
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
