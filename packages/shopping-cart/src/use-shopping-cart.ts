import { useContext, useState, useEffect, useRef } from 'react';
import { createShoppingCartHookManager } from './shopping-cart-hook-manager';
import ShoppingCartOptionsContext from './shopping-cart-options-context';
import useManagerClient from './use-manager-client';
import useRefetchOnFocus from './use-refetch-on-focus';
import type { UseShoppingCart } from './types';

export default function useShoppingCart( cartKey?: string ): UseShoppingCart {
	const managerClient = useManagerClient( 'useShoppingCart' );

	const { defaultCartKey } = useContext( ShoppingCartOptionsContext );
	const finalCartKey = cartKey ?? defaultCartKey;
	const manager = managerClient.forCartKey( finalCartKey );
	const hookManager = createShoppingCartHookManager( manager );

	useRefetchOnFocus( finalCartKey );

	useEffect( () => {
		manager.fetchInitialCart();
	}, [ manager ] );

	const isMounted = useRef( true );
	useEffect( () => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [] );

	// Re-render when the cart changes
	const [ cartState, setCartState ] = useState( hookManager.getState() );
	useEffect( () => {
		return manager.subscribe( () => {
			isMounted.current && setCartState( hookManager.getState() );
		} );
	}, [ hookManager, manager ] );

	return cartState;
}
