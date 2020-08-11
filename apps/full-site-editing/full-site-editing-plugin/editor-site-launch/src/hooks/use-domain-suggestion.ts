/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * External dependencies
 */
import { DOMAINS_STORE, LAUNCH_STORE } from '../stores';

export function useDomainSuggestion() {
	const { domainSearch } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const suggestion = useSelect(
		( select ) => {
			if ( ! domainSearch || domainSearch.length < 2 ) {
				return;
			}
			return select( DOMAINS_STORE ).getDomainSuggestions( domainSearch, {
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
