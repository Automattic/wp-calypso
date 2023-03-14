import { useSelect } from '@wordpress/data';
import { DOMAIN_SUGGESTIONS_STORE } from '../stores/domain-suggestions';
import { ONBOARD_STORE } from '../stores/onboard';
import type { DomainSuggestionsSelect, OnboardSelect } from '@automattic/data-stores';

export function useFreeDomainSuggestion() {
	const domainSearch = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainSearch(),
		[]
	);

	return useSelect(
		( select ) => {
			if ( ! domainSearch ) {
				return;
			}
			return ( select( DOMAIN_SUGGESTIONS_STORE ) as DomainSuggestionsSelect ).getDomainSuggestions(
				domainSearch,
				{
					// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
					include_wordpressdotcom: true,
					quantity: 1,
				}
			)?.[ 0 ];
		},
		[ domainSearch ]
	);
}
