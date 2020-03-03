/**
 * External dependencies
 */
import { useLineItems } from '@automattic/composite-checkout';

export function useHasDomainsInCart() {
	const [ items ] = useLineItems();
	return areDomainsInLineItems( items );
}

export function areDomainsInLineItems( items ) {
	if ( items.find( isLineItemADomain ) ) {
		return true;
	}
	return false;
}

export function isLineItemADomain( item ) {
	return item.wpcom_meta?.is_domain_registration;
}
