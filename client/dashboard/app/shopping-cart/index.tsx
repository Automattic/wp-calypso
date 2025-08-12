import { createShoppingCartManagerClient } from '@automattic/shopping-cart'; // eslint-disable-line no-restricted-imports
import { wpcomGetCart, wpcomSetCart } from '../../data/me-shopping-cart';

export const shoppingCartManagerClient = createShoppingCartManagerClient( {
	getCart: wpcomGetCart,
	setCart: wpcomSetCart,
} );
