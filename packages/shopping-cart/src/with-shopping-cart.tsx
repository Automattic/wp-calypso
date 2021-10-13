import * as React from 'react';
import useManagerClient from './use-manager-client';
import useShoppingCart from './use-shopping-cart';
import type { WithShoppingCartProps } from './types';

export default function withShoppingCart< ComponentProps >(
	Component: React.ComponentType< ComponentProps & WithShoppingCartProps >,
	mapPropsToCartKey?: ( props: ComponentProps ) => string | undefined
): React.FC< ComponentProps > {
	return function ShoppingCartWrapper( props ): JSX.Element {
		const cartKey = mapPropsToCartKey
			? mapPropsToCartKey( props )
			: ( props as Record< string, string | undefined > ).cartKey;

		// Even though managerClient isn't used here this guard will provide a
		// better error message than waiting for the one in useShoppingCart.
		useManagerClient( 'withShoppingCart' );

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
