/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import useShoppingCart from './use-shopping-cart';

export default function withShoppingCart< P >( Component: React.ComponentType< P > ) {
	return function ShoppingCartWrapper( props: P ): JSX.Element {
		const shoppingCartManager = useShoppingCart();
		return (
			<Component
				{ ...props }
				shoppingCartManager={ shoppingCartManager }
				cart={ shoppingCartManager.responseCart }
			/>
		);
	};
}
