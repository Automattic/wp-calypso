/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useDebounce } from 'use-debounce';

/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_STORE } from '../stores/domain-suggestions';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { selectorDebounce } from '../constants';

export function useDomainSuggestions( { searchOverride = '', locale = 'en' } ) {
	const { siteTitle, siteVertical, domainSearch } = useSelect( select =>
		select( ONBOARD_STORE ).getState()
	);

	const [ searchTerm ] = useDebounce(
		searchOverride.trim() || domainSearch.trim() || siteTitle || siteVertical?.label.trim() || '',
		selectorDebounce
	);

	return useSelect(
		select => {
			if ( ! searchTerm ) {
				return;
			}
			return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( searchTerm, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: true,
				include_dotblogsubdomain: false,
				locale,
				...{ vertical: siteVertical?.id },
			} );
		},
		[ searchTerm, siteVertical ]
	);
}
