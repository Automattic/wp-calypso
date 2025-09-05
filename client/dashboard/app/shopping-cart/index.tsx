import { fetchShoppingCart, updateShoppingCart } from '@automattic/api-core';
import { createShoppingCartManagerClient } from '@automattic/shopping-cart'; // eslint-disable-line no-restricted-imports

export const shoppingCartManagerClient = createShoppingCartManagerClient( {
	getCart: fetchShoppingCart,
	setCart: updateShoppingCart,
} );
