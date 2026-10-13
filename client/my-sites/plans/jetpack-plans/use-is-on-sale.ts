import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import { getFreshProductsList, isListedProductOnSale } from 'calypso/state/products-list/selectors';

export default function useIsOnSale() {
	const productsList = useSelector( getFreshProductsList );

	return useCallback(
		( productSlug: string ) => isListedProductOnSale( productsList, productSlug ),
		[ productsList ]
	);
}
