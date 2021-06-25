/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import type { RequestCart, ResponseCart, ShoppingCartManagerOptions } from './types';
import useShoppingCartManager from './use-shopping-cart-manager';
import ShoppingCartContext from './shopping-cart-context';

export default function ShoppingCartProvider( {
	cartKey,
	setCart,
	getCart,
	options,
	children,
}: {
	cartKey: string | number | null | undefined;
	setCart: ( cartKey: string, requestCart: RequestCart ) => Promise< ResponseCart >;
	getCart: ( cartKey: string ) => Promise< ResponseCart >;
	options?: ShoppingCartManagerOptions;
	children: React.ReactNode;
} ): JSX.Element {
	const shoppingCartManager = useShoppingCartManager( {
		cartKey,
		setCart,
		getCart,
		options,
	} );

	return (
		<ShoppingCartContext.Provider value={ shoppingCartManager }>
			{ children }
		</ShoppingCartContext.Provider>
	);
}
