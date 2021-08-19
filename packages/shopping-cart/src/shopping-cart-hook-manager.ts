import type { UseShoppingCart, ShoppingCartManager } from './types';

export function createUseShoppingCartState( manager: ShoppingCartManager ): UseShoppingCart {
	const managerState = manager.getState();
	return { ...manager.actions, ...managerState };
}
