import { useSelect } from '@wordpress/data';
import { DOMAIN_SUGGESTIONS_STORE } from '../constants';

export function useDomainAvailabilities() {
	return useSelect( ( select ) => {
		return select( DOMAIN_SUGGESTIONS_STORE ).getDomainAvailabilities();
	}, [] );
}
