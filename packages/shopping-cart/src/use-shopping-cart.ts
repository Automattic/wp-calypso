import debugFactory from 'debug';
import { useContext, useState, useEffect, useRef, useMemo } from 'react';
import ShoppingCartContext from './shopping-cart-context';
import ShoppingCartOptionsContext from './shopping-cart-options-context';
import useRefetchOnFocus from './use-refetch-on-focus';
import type { UseShoppingCart } from './types';

const debug = debugFactory( 'shopping-cart:use-shopping-cart' );

export default function useShoppingCart( cartKey?: string | undefined ): UseShoppingCart {
	const managerClient = useContext( ShoppingCartContext );
	if ( ! managerClient ) {
		throw new Error( 'useShoppingCart must be used inside a ShoppingCartProvider' );
	}

	const { defaultCartKey } = useContext( ShoppingCartOptionsContext ) ?? {};
	const finalCartKey = cartKey ?? defaultCartKey;
	debug( `getting cart manager for cartKey ${ finalCartKey }` );
	const manager = managerClient.forCartKey( finalCartKey );

	// Re-render when the cart changes
	const isMounted = useRef< boolean >( true );
	useEffect( () => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [] );
	const [ cartState, setCartState ] = useState( manager.getState() );
	useEffect( () => {
		if ( finalCartKey ) {
			debug( 'subscribing to cartKey', finalCartKey );
			return managerClient.forCartKey( finalCartKey ).subscribe( () => {
				debug( 'cart manager changed; re-rendering' );
				isMounted.current && setCartState( manager.getState() );
			} );
		}
	}, [ managerClient, finalCartKey, manager ] );

	useRefetchOnFocus( finalCartKey );

	return useMemo(
		() => ( {
			...cartState,
			...manager.actions,
		} ),
		[ cartState, manager ]
	);
}
