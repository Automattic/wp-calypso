/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_STORE } from '../stores';
import { useDomainSearch } from './';

export function useDomainSuggestion(): DomainSuggestions.DomainSuggestion | undefined {
	const domainSearch = useDomainSearch();

	const suggestion = useSelect(
		( select ) => {
			if ( ! domainSearch || domainSearch.length < 2 ) {
				return;
			}
			return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( domainSearch, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: false,
				include_dotblogsubdomain: false,
				quantity: 1, // this will give the recommended domain only
				// TODO: support i18n
				locale: 'en',
			} );
		},
		[ domainSearch ]
	)?.[ 0 ];

	return suggestion;
}
