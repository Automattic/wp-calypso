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

	return (
		<ShoppingCartProvider
			cartKey={ cartKey || getCartKey( { selectedSite } ) }
			getCart={ getCart || wpcomGetCart }
			setCart={ wpcomSetCart }
		>
			{ children }
		</ShoppingCartProvider>
	);
}
