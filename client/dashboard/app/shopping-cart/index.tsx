import { wpcomGetCart, wpcomSetCart } from '@automattic/api-core';
import { createShoppingCartManagerClient } from '@automattic/shopping-cart'; // eslint-disable-line no-restricted-imports

export const shoppingCartManagerClient = createShoppingCartManagerClient( {
	getCart: wpcomGetCart,
	setCart: wpcomSetCart,
} );

export { useWPCOMShoppingCartForDomainSearch } from './use-wpcom-shopping-cart-for-domain-search';
