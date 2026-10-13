import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'calypso/state';
import {
	getFreshJetpackProductsList,
	isListedProductOnSale,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';

export default function useIsOnSale() {
	const productsList = useSelector( getFreshJetpackProductsList );

	return useCallback(
		( productSlug: string ) => isListedProductOnSale( productsList, productSlug ),
		[ productsList ]
	);
}

/**
 * Like `useIsOnSale`, but reports `unknown` until the list arrives or a request
 * for it fails, for pages that must wait before skipping an offer.
 */
export function useOnSaleStatus( productSlug?: string ): 'unknown' | 'on-sale' | 'off-sale' {
	const isOnSale = useIsOnSale();
	const hasReceived = useSelector(
		( state ) => getFreshJetpackProductsList( state ) !== undefined
	);
	const isFetching = useSelector( isProductsListFetching );
	const [ hasRequested, setHasRequested ] = useState( false );

	useEffect( () => {
		if ( isFetching ) {
			setHasRequested( true );
		}
	}, [ isFetching ] );

	if ( ! hasReceived && ! ( hasRequested && ! isFetching ) ) {
		return 'unknown';
	}

	return productSlug && isOnSale( productSlug ) ? 'on-sale' : 'off-sale';
}
