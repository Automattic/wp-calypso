/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import { ShoppingCartProvider, useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal Dependencies
 */
import useCartKey from './use-cart-key';
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
	const defaultCartKey = useCartKey();

	const options = useMemo(
		() => ( {
			refetchOnWindowFocus: true,
			defaultCartKey,
		} ),
		[ defaultCartKey ]
	);

	return (
		<ShoppingCartProvider managerClient={ cartManagerClient } options={ options }>
			<CalypsoShoppingCartMessages />
			{ children }
		</ShoppingCartProvider>
	);
}

function CalypsoShoppingCartMessages() {
	const { responseCart, isLoading } = useShoppingCart();
	return <CartMessages cart={ responseCart } isLoadingCart={ isLoading } />;
}
