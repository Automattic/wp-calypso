/**
 * External dependencies
 */
import React, { useContext } from 'react';

const CartContext = React.createContext( {} );

export function CartProvider( { children, cart } ) {
	return <CartContext.Provider value={ cart }>{ children }</CartContext.Provider>;
}

export function useCart() {
	const cart = useContext( CartContext );
	return cart;
}
