/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { ShoppingCartProvider } from '@automattic/shopping-cart';
import type { RequestCart, ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal Dependencies
 */
import wp from 'calypso/lib/wp';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getCartKey from './get-cart-key';

// Aliasing wpcom functions explicitly bound to wpcom is required here;
// otherwise we get `this is not defined` errors.
const wpcom = wp.undocumented();
const wpcomGetCart = ( cartKey: string ) => wpcom.getCart( cartKey );
const wpcomSetCart = ( cartKey: string, cartData: RequestCart ) =>
	wpcom.setCart( cartKey, cartData );

// A convenience wrapper around ShoppingCartProvider to set the necessary props for calypso
export default function CalypsoShoppingCartProvider( {
	children,
	cartKey,
	getCart,
}: {
	children: React.ReactNode;
	cartKey?: string | number | null | undefined;
	getCart?: ( cartKey: string ) => Promise< ResponseCart >;
} ): JSX.Element {
	const selectedSite = useSelector( getSelectedSite );

	// If cartKey is null, we pass that to ShoppingCartProvider because it is
	// probably intentional to delay loading. If cartKey is undefined, we try to
	// get our own.
	return (
		<ShoppingCartProvider
			cartKey={ cartKey === undefined ? getCartKey( { selectedSite } ) : cartKey }
			getCart={ getCart || wpcomGetCart }
			setCart={ wpcomSetCart }
		>
			{ children }
		</ShoppingCartProvider>
	);
}
