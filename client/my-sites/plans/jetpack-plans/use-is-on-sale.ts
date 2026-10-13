import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import { getProductsList, isListedProductOnSale } from 'calypso/state/products-list/selectors';

export default function useIsOnSale() {
	const productsList = useSelector( getProductsList );

	return useCallback(
		( productSlug: string ) => isListedProductOnSale( productsList, productSlug ),
		[ productsList ]
	);
}
