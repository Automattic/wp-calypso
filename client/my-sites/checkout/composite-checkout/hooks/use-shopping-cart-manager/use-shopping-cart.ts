/**
 * External dependencies
 */
import { useContext } from 'react';

/**
 * Internal dependencies
 */
import { ShoppingCartManager } from './types';
import ShoppingCartContext from './shopping-cart-context';

export default function useShoppingCart(): ShoppingCartManager {
	const manager = useContext( ShoppingCartContext );
	if ( ! manager ) {
		throw new Error( 'useShoppingCart must be used inside a ShoppingCartProvider' );
	}
	return manager;
}
