/**
 * External dependencies
 */
import { useLineItems } from '@automattic/composite-checkout';

export function useHasPlanInCart() {
	const [ items ] = useLineItems();
	return isPlanInLineItems( items );
}

export function isPlanInLineItems( items ) {
	return items.some( ( item ) => 'plan' === item.type );
}
