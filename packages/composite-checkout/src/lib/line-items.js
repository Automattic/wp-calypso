/**
 * External dependencies
 */
import React, { useContext } from 'react';

/**
 * Internal dependencies
 */
import LineItemsContext from './line-items-context';

export function LineItemsProvider( { items, total, children } ) {
	const value = { items, total };
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

export function useHasDomainsInCart() {
	const [ items ] = useLineItems();

	if ( items.find( item => item.type === 'domain' ) ) {
		return true;
	}

	return false;
}
