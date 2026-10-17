import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import {
	getFreshProductsList,
	hasProductsListRequestFailed,
	isListedProductOnSale,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';

export default function useIsOnSale() {
	const productsList = useSelector( getFreshProductsList );

	return useCallback(
		( productSlug: string ) => isListedProductOnSale( productsList, productSlug ),
		[ productsList ]
	);
}

/**
 * Like `useIsOnSale`, but reports `unknown` until the list arrives or requesting
 * it has failed, for pages that must wait before skipping an offer.
 */
export function useOnSaleStatus( productSlug?: string ): 'unknown' | 'on-sale' | 'off-sale' {
	const productsList = useSelector( getFreshProductsList );
	const hasFailed = useSelector(
		( state ) => hasProductsListRequestFailed( state ) && ! isProductsListFetching( state )
	);

	if ( ! productsList && ! hasFailed ) {
		return 'unknown';
	}

	return productSlug && isListedProductOnSale( productsList, productSlug ) ? 'on-sale' : 'off-sale';
}
