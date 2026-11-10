import { fetchShoppingCart, updateShoppingCart } from '@automattic/api-core';
import { createShoppingCartManagerClient } from '@automattic/shopping-cart';

export const shoppingCartManagerClient = createShoppingCartManagerClient( {
	getCart: fetchShoppingCart,
	setCart: updateShoppingCart,
} );
