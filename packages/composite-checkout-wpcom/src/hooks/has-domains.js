/**
 * External dependencies
 */
import { useLineItems } from '@automattic/composite-checkout';

export function useHasDomainsInCart() {
	const [ items ] = useLineItems();
	return areDomainsInLineItems( items );
}

export function areDomainsInLineItems( items ) {
	if ( items.find( item => item.type === 'domain' ) ) {
		return true;
	}
	return false;
}
