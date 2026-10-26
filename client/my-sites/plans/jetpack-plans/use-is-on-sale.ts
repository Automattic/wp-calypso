import config from '@automattic/calypso-config';
import { JETPACK_PRO_PLANS, PLAN_JETPACK_SECURITY_T1_YEARLY } from '@automattic/calypso-products';
import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import {
	getFreshProductsList,
	hasProductsListRequestFailed,
	isListedProductOnSale,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';

type ProductsList = Parameters< typeof isListedProductOnSale >[ 0 ];

/* Every bundle follows the catalog unless a fresh list still offers Security, as before launch or
 * after a full restore, so turning Pro alone off cannot bring the retired bundles back. */
const isGatingEveryBundle = ( productsList: ProductsList ) =>
	config.isEnabled( 'jetpack/pro-bundles' ) ||
	! isListedProductOnSale( productsList, PLAN_JETPACK_SECURITY_T1_YEARLY );

/**
 * Whether a bundle may be offered.
 */
export default function useIsOnSale() {
	const productsList = useSelector( getFreshProductsList );

	return useCallback(
		( productSlug: string ) =>
			( ! isGatingEveryBundle( productsList ) &&
				! ( JETPACK_PRO_PLANS as ReadonlyArray< string > ).includes( productSlug ) ) ||
			isListedProductOnSale( productsList, productSlug ),
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

	if ( ! isGatingEveryBundle( productsList ) ) {
		return 'on-sale';
	}

	if ( ! productsList && ! hasFailed ) {
		return 'unknown';
	}

	return productSlug && isListedProductOnSale( productsList, productSlug ) ? 'on-sale' : 'off-sale';
}
