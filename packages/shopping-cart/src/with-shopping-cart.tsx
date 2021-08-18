import React from 'react';
import useShoppingCart from './use-shopping-cart';
import type { WithShoppingCartProps } from './types';

export default function withShoppingCart< ComponentProps >(
	Component: React.ComponentType< ComponentProps & WithShoppingCartProps >
): React.FC< ComponentProps > {
	return function ShoppingCartWrapper( props ): JSX.Element {
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
