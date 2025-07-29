import { createShoppingCartManagerClient } from '@automattic/shopping-cart'; // eslint-disable-line no-restricted-imports
import { wpcomGetCart, wpcomSetCart } from 'calypso/data/api/me-shopping-cart';

export const shoppingCartManagerClient = createShoppingCartManagerClient( {
	getCart: wpcomGetCart,
	setCart: wpcomSetCart,
} );
