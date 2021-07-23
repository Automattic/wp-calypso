import { useContext } from 'react';
import ShoppingCartContext from './shopping-cart-context';
import type { ShoppingCartManager } from './types';

export default function useShoppingCart(): ShoppingCartManager {
	const manager = useContext( ShoppingCartContext );
	if ( ! manager ) {
		throw new Error( 'useShoppingCart must be used inside a ShoppingCartProvider' );
	}
	return manager;
}
