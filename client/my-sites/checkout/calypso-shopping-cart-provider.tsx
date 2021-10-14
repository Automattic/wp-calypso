import { ShoppingCartProvider } from '@automattic/shopping-cart';
import { useMemo } from 'react';
import * as React from 'react';
import CartMessages from 'calypso/my-sites/checkout/cart/cart-messages';
import { cartManagerClient } from './cart-manager-client';

// A convenience wrapper around ShoppingCartProvider to set the necessary props
// for calypso and to display error and success messages returned from calls to
// the cart endpoint.
export default function CalypsoShoppingCartProvider( {
	children,
}: {
	children: React.ReactNode;
} ): JSX.Element {
	const options = useMemo(
		() => ( {
			refetchOnWindowFocus: true,
		} ),
		[]
	);

	return (
		<ShoppingCartProvider managerClient={ cartManagerClient } options={ options }>
			<CartMessages />
			{ children }
		</ShoppingCartProvider>
	);
}
