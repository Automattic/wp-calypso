import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { requestProductsList } from 'calypso/state/products-list/actions';
import {
	getFreshProductsList,
	isListedProductOnSale,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

const requestJetpackProductsListIfIdle =
	() =>
	( dispatch: CalypsoDispatch, getState: () => AppState ): boolean => {
		const state = getState();
		if ( isProductsListFetching( state ) || getFreshProductsList( state ) ) {
			return false;
		}

		dispatch( requestProductsList( { type: 'jetpack' } ) );
		return true;
	};

/*
 * The page's own QueryProductsList is skipped while another products request is
 * in flight. If that one settles without a full list, request it once more here.
 */
function useFreshProductsList() {
	const dispatch = useDispatch();
	const productsList = useSelector( getFreshProductsList );
	const isFetching = useSelector( isProductsListFetching );
	const [ hasRetried, setHasRetried ] = useState( false );

	useEffect( () => {
		if ( productsList || isFetching || hasRetried ) {
			return;
		}

		if ( dispatch( requestJetpackProductsListIfIdle() ) ) {
			setHasRetried( true );
		}
	}, [ dispatch, productsList, isFetching, hasRetried ] );

	return { productsList, hasGivenUp: hasRetried && ! isFetching && ! productsList };
}

export default function useIsOnSale() {
	const { productsList } = useFreshProductsList();

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
	const { productsList, hasGivenUp } = useFreshProductsList();

	if ( ! productsList && ! hasGivenUp ) {
		return 'unknown';
	}

	return productSlug && isListedProductOnSale( productsList, productSlug ) ? 'on-sale' : 'off-sale';
}
