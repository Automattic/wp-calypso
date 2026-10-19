import { JETPACK_PRO_PLANS } from '@automattic/calypso-products';
import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import { getFreshProductsList, isListedProductOnSale } from 'calypso/state/products-list/selectors';

/**
 * Whether a bundle may be offered. Only Pro waits for the catalog to say it is on sale;
 * every other bundle shows as before, so nothing else changes until Pro launches.
 */
export default function useIsOnSale() {
	const productsList = useSelector( getFreshProductsList );

	return useCallback(
		( productSlug: string ) =>
			! ( JETPACK_PRO_PLANS as ReadonlyArray< string > ).includes( productSlug ) ||
			isListedProductOnSale( productsList, productSlug ),
		[ productsList ]
	);
}
