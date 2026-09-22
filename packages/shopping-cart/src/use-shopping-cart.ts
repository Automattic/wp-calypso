import { useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import ShoppingCartOptionsContext from './shopping-cart-options-context';
import useManagerClient from './use-manager-client';
import useRefetchOnFocus from './use-refetch-on-focus';
import type { UseShoppingCart, CartKey } from './types';

export default function useShoppingCart( cartKey: CartKey | undefined ): UseShoppingCart {
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

	// Read the current manager's snapshot during render so a cart key change
	// never returns the previous cart or its actions.
	const managerState = useSyncExternalStore(
		manager.subscribe,
		manager.getState,
		manager.getState
	);

	return useMemo( () => ( { ...manager.actions, ...managerState } ), [ manager, managerState ] );
}
