/**
 * External dependencies
 */
import { useLineItems } from '@automattic/composite-checkout';

export function useHasRenewalInCart() {
	const [ items ] = useLineItems();
	return isRenewalInLineItems( items );
}

export function isRenewalInLineItems( items ) {
	return items.some( isLineItemARenewal );
}

export function isLineItemARenewal( item ) {
	return 'renewal' === ( item.wpcom_meta?.extra?.purchaseType ?? '' );
}
