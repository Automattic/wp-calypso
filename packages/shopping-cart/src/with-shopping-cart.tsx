import useManagerClient from './use-manager-client';
import useShoppingCart from './use-shopping-cart';
import type { WithShoppingCartProps, CartKey } from './types';
import type { ComponentType } from 'react';

export type AdditionalCartKeyProp = { cartKey?: CartKey };

export default function withShoppingCart< P >(
	Component: ComponentType< P & AdditionalCartKeyProp >,
	mapPropsToCartKey?: ( props: P ) => CartKey | undefined
) {
	return function ShoppingCartWrapper(
		props: Omit< P & AdditionalCartKeyProp, keyof WithShoppingCartProps >
	) {
		const cartKey = mapPropsToCartKey ? mapPropsToCartKey( props as P ) : props.cartKey;

		// Even though managerClient isn't used here this guard will provide a
		// better error message than waiting for the one in useShoppingCart.
		useManagerClient( 'withShoppingCart' );

		const shoppingCartManager = useShoppingCart( cartKey );
		return (
			<Component
				{ ...( props as P ) }
				shoppingCartManager={ shoppingCartManager }
				cart={ shoppingCartManager.responseCart }
			/>
		);
	};
}
