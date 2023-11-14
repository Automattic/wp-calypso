import { useContext, useState, useEffect, useRef } from 'react';
import { createUseShoppingCartState } from './shopping-cart-hook-manager';
import ShoppingCartOptionsContext from './shopping-cart-options-context';
import useManagerClient from './use-manager-client';
import useRefetchOnFocus from './use-refetch-on-focus';
import type { UseShoppingCart, CartKey } from './types';

export default function useTemporaryShoppingCart( cartKey: CartKey | undefined ): UseShoppingCart {
	const managerClient = useManagerClient( 'useShoppingCart' );

	const { defaultCartKey } = useContext( ShoppingCartOptionsContext );
	const finalCartKey = cartKey ?? defaultCartKey;
	const manager = managerClient.forCartKey( finalCartKey );

	useRefetchOnFocus( finalCartKey );

	useEffect( () => {
		manager.fetchInitialCart().catch( () => {
			// The consumer of the cart data can display any errors returned by the
			// endpoint, so we will ignore them here.
		} );
	}, [ manager ] );

	const isMounted = useRef( true );
	useEffect( () => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [] );

	// Re-render when the cart changes
	const [ cartState, setCartState ] = useState( createUseShoppingCartState( manager ) );
	useEffect( () => {
		return manager.subscribe( () => {
			isMounted.current && setCartState( createUseShoppingCartState( manager ) );
		} );
	}, [ manager ] );

	return cartState;
}
