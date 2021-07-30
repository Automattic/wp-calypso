import React, { useContext } from 'react';
import ShoppingCartContext from './shopping-cart-context';
import useShoppingCart from './use-shopping-cart';
import type { WithShoppingCartProps } from './types';

export default function withShoppingCart< ComponentProps >(
	Component: React.ComponentType< ComponentProps & WithShoppingCartProps >,
	mapPropsToCartKey?: ( props: ComponentProps ) => string | undefined
): React.FC< ComponentProps > {
	return function ShoppingCartWrapper( props ): JSX.Element {
		const cartKey = mapPropsToCartKey?.( props );

		// Even though managerClient isn't used here this guard will provide a
		// better error message than waiting for the one in useShoppingCart.
		const managerClient = useContext( ShoppingCartContext );
		if ( ! managerClient ) {
			throw new Error( 'withShoppingCart must be used inside a ShoppingCartProvider' );
		}

		const shoppingCartManager = useShoppingCart( cartKey );
		return (
			<Component
				{ ...props }
				shoppingCartManager={ shoppingCartManager }
				cart={ shoppingCartManager.responseCart }
			/>
		);
	};
}
