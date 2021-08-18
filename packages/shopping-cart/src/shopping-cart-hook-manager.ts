import type {
	UseShoppingCart,
	ShoppingCartManagerState,
	ShoppingCartManager,
	ShoppingCartHookManager,
} from './types';

export function createShoppingCartHookManager(
	manager: ShoppingCartManager
): ShoppingCartHookManager {
	let cachedUseShoppingCart: UseShoppingCart;
	let lastManagerState: ShoppingCartManagerState;
	return {
		getState: () => {
			const managerState = manager.getState();
			if ( lastManagerState !== managerState ) {
				cachedUseShoppingCart = { ...manager.actions, ...managerState };
				lastManagerState = managerState;
			}
			return cachedUseShoppingCart;
		},
	};
}
