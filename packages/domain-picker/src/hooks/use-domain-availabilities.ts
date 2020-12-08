/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_STORE } from '../constants';

export function useDomainAvailabilities() {
	return useSelect( ( select ) => {
		return select( DOMAIN_SUGGESTIONS_STORE ).getDomainAvailabilities();
	}, [] );
}
