/**
 * External dependencies
 */
import React, { useContext, useMemo } from 'react';

/**
 * Internal dependencies
 */
import LineItemsContext from './line-items-context';
import { LineItemsProviderProps, LineItem } from '../types';

export const LineItemsProvider: React.FC< LineItemsProviderProps > = ( {
	items,
	total,
	children,
} ) => {
	const value = useMemo( () => ( { items, total } ), [ items, total ] );
	return <LineItemsContext.Provider value={ value }>{ children }</LineItemsContext.Provider>;
};

export function useLineItems(): [ LineItem[], LineItem ] {
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

export function useLineItemsOfType( itemType: string ): LineItem[] {
	if ( ! itemType ) {
		throw new Error( 'missing itemType for useLineItemsOfType' );
	}
	const [ items ] = useLineItems();
	return items.filter( ( item: LineItem ) => item.type === itemType );
}
