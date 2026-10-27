import { fetchShoppingCart, updateShoppingCart } from '@automattic/api-core';
import { createShoppingCartManagerClient } from '@automattic/shopping-cart';

export const cartManagerClient = createShoppingCartManagerClient( {
	getCart: fetchShoppingCart,
	setCart: updateShoppingCart,
} );
