import { fetchShoppingCart, updateShoppingCart } from '@automattic/api-core';
import { createShoppingCartManagerClient } from '@automattic/shopping-cart';
import { earlyRequestKeys, withEarlyRequest } from './src/lib/early-requests';
import type { CartKey, ResponseCart } from '@automattic/shopping-cart';

function getCart( cartKey: CartKey ): Promise< ResponseCart > {
	// The checkout route may already have asked for this cart, by site slug,
	// while the site's ID was still being looked up.
	if ( typeof cartKey !== 'number' ) {
		return fetchShoppingCart( cartKey );
	}
	return withEarlyRequest< ResponseCart >(
		earlyRequestKeys.cart,
		() => fetchShoppingCart( cartKey ),
		( cart ) => cart?.cart_key === cartKey
	);
}

export const cartManagerClient = createShoppingCartManagerClient( {
	getCart,
	setCart: updateShoppingCart,
} );
