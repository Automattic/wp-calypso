import { DomainSuggestions } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';

export function useDomainAvailabilities() {
	return useSelect( ( select ) => {
		return select( DomainSuggestions.store ).getDomainAvailabilities();
	}, [] );
}
