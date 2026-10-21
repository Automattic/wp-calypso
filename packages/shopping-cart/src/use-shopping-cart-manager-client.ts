import useManagerClient from './use-manager-client';
import type { ShoppingCartManagerClient } from './types';

/**
 * Returns the `ShoppingCartManagerClient` provided by the surrounding
 * `ShoppingCartProvider` without subscribing to a specific cart. Useful for
 * code paths that need to dispatch an action against a cart that the component
 * does not otherwise render — using `useShoppingCart()` for that purpose would
 * eagerly fetch the cart on every render.
 */
export default function useShoppingCartManagerClient(): ShoppingCartManagerClient {
	return useManagerClient( 'useShoppingCartManagerClient' );
}
