import { ShoppingCartProvider } from '@automattic/shopping-cart';
import { useMemo, PropsWithChildren } from 'react';
import CartMessages from 'calypso/my-sites/checkout/cart/cart-messages';
import { cartManagerClient } from './cart-manager-client';

// A convenience wrapper around ShoppingCartProvider to set the necessary props
// for calypso and to display error and success messages returned from calls to
// the cart endpoint.
// eslint-disable-next-line @typescript-eslint/ban-types
export default function CalypsoShoppingCartProvider( {
	children,
	shouldShowPersistentErrors,
}: PropsWithChildren< {
	/**
	 * Persistent errors like "Purchases are disabled for this site" are returned
	 * during cart fetch (regular cart errors are transient and only are returned
	 * when changing the cart). We want to display these errors only in certain
	 * contexts where they will make sense (like checkout), not in every place
	 * that happens to render this component (like the plans page).
	 */
	shouldShowPersistentErrors?: boolean;
} > ) {
	const options = useMemo(
		() => ( {
			refetchOnWindowFocus: true,
		} ),
		[]
	);

	return (
		<ShoppingCartProvider managerClient={ cartManagerClient } options={ options }>
			<CartMessages shouldShowPersistentErrors={ shouldShowPersistentErrors } />
			{ children }
		</ShoppingCartProvider>
	);
}
