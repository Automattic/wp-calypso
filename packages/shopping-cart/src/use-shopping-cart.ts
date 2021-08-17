import { useContext, useState, useEffect, useRef, useMemo } from 'react';
import ShoppingCartContext from './shopping-cart-context';
import ShoppingCartOptionsContext from './shopping-cart-options-context';
import useRefetchOnFocus from './use-refetch-on-focus';
import type { UseShoppingCart } from './types';

export default function useShoppingCart( cartKey?: string ): UseShoppingCart {
	const managerClient = useContext( ShoppingCartContext );
	if ( ! managerClient ) {
		throw new Error( 'useShoppingCart must be used inside a ShoppingCartProvider' );
	}

	const { defaultCartKey } = useContext( ShoppingCartOptionsContext ) ?? {};
	const finalCartKey = cartKey ?? defaultCartKey;
	const manager = managerClient.forCartKey( finalCartKey );

	// Re-render when the cart changes
	const isMounted = useRef( true );
	useEffect( () => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [] );
	const [ cartState, setCartState ] = useState( manager.getState() );
	useEffect( () => {
		return manager.subscribe( () => {
			isMounted.current && setCartState( manager.getState() );
		} );
	}, [ manager ] );

	useRefetchOnFocus( finalCartKey );

	return useMemo(
		() => ( {
			...cartState,
			...manager.actions,
		} ),
		[ cartState, manager ]
	);
}
