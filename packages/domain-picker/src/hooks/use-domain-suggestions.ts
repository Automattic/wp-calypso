/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { DomainSuggestions } from '@automattic/data-stores';

import { DOMAIN_SUGGESTION_VENDOR, PAID_DOMAINS_TO_SHOW } from './constants';

const DOMAIN_SUGGESTIONS_STORE = DomainSuggestions.register( {
	vendor: DOMAIN_SUGGESTION_VENDOR,
} );

export function useDomainSuggestions(
	searchTerm = '',
	domainCategory?: string,
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
