/**
 * External dependencies
 */
import { useLineItems } from '@automattic/composite-checkout';

export function useHasDomainsInCart() {
	const [ items ] = useLineItems();

	if ( items.find( item => item.type === 'domain' ) ) {
		return true;
	}

	return false;
}
