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

export function useFreeDomainSuggestion() {
	const { siteTitle, siteVertical } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );

	const [ domainSearch ] = useDebounce( siteTitle, selectorDebounce );

	return useSelect(
		( select ) => {
			if ( ! domainSearch ) {
				return;
			}
			return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( domainSearch, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: true,
				quantity: 1,
				...{ vertical: siteVertical?.id },
			} )?.[ 0 ];
		},
		[ domainSearch, siteVertical ]
	);
}
