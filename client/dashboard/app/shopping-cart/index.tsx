import { fetchShoppingCart, updateShoppingCart } from '@automattic/api-core';
import { createShoppingCartManagerClient } from '@automattic/shopping-cart'; // eslint-disable-line no-restricted-imports

export const shoppingCartManagerClient = createShoppingCartManagerClient( {
	getCart: fetchShoppingCart,
	setCart: updateShoppingCart,
} );

export { useWPCOMShoppingCartForDomainSearch } from './use-wpcom-shopping-cart-for-domain-search';
