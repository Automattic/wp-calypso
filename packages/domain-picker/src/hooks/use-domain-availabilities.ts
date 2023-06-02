import { useSelect } from '@wordpress/data';
import { DOMAIN_SUGGESTIONS_STORE } from '../constants';
import type { DomainSuggestionsSelect } from '@automattic/data-stores';

export function useDomainAvailabilities() {
	return useSelect( ( select ) => {
		return (
			select( DOMAIN_SUGGESTIONS_STORE ) as DomainSuggestionsSelect
		 ).getDomainAvailabilities();
	}, [] );
}
