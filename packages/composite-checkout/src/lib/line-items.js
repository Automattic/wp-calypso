/**
 * External dependencies
 */
import React, { useContext, useMemo } from 'react';

/**
 * Internal dependencies
 */
import LineItemsContext from './line-items-context';

export function LineItemsProvider( { items, total, children } ) {
	const value = useMemo( () => ( { items, total } ), [ items, total ] );
	return <LineItemsContext.Provider value={ value }>{ children }</LineItemsContext.Provider>;
}

export function useLineItems() {
	const { items, total } = useContext( LineItemsContext );
	if ( ! items || ! total ) {
		throw new Error( 'useLineItems can only be used inside a CheckoutProvider' );
	}
	return [ items, total ];
}

export function useTotal() {
	const [ , total ] = useLineItems();
	return total;
}

export function useLineItemsOfType( itemType ) {
	if ( ! itemType ) {
		throw new Error( 'missing itemType for useLineItemsOfType' );
	}
	const [ items ] = useLineItems();
	return items.filter( ( item ) => item.type === itemType );
}
