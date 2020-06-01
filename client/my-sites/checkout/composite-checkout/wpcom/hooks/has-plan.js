/**
 * External dependencies
 */
import { useLineItems } from '@automattic/composite-checkout';

export function useHasPlanInCart() {
	const [ items ] = useLineItems();
	return isPlanInLineItems( items );
}

export function usePlanInCart() {
	const [ items ] = useLineItems();
	return items.find( isLineItemAPlan );
}

export function isPlanInLineItems( items ) {
	return items.some( isLineItemAPlan );
}

export function isLineItemAPlan( item ) {
	return 'plan' === item.type;
}
