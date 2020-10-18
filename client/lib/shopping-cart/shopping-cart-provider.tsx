/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { RequestCart, ResponseCart } from './types';
import useShoppingCartManager from './use-shopping-cart-manager';
import ShoppingCartContext from './shopping-cart-context';

export default function ShoppingCartProvider( {
	cartKey,
	setCart,
	getCart,
	children,
}: {
	cartKey: string | number | null | undefined;
	setCart: ( cartKey: string, requestCart: RequestCart ) => Promise< ResponseCart >;
	getCart: ( cartKey: string ) => Promise< ResponseCart >;
	children: JSX.Element;
} ): JSX.Element {
	const shoppingCartManager = useShoppingCartManager( {
		cartKey,
		setCart,
		getCart,
	} );

	return (
		<ShoppingCartContext.Provider value={ shoppingCartManager }>
			{ children }
		</ShoppingCartContext.Provider>
	);
}
