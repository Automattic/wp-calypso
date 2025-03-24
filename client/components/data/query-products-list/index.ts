import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { isProductsListFetching, getProductsListType } from 'calypso/state/products-list/selectors';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

type QueryProductsListProps = {
	type?: string;
	currency?: string;
	persist?: boolean;
	productSlugList?: string[];
};

const request =
	( {
		type = 'all',
		persist,
		productSlugList,
		...props
	}: QueryProductsListProps ): ThunkAction< void, AppState, undefined, Action > =>
	( dispatch: CalypsoDispatch, getState: () => AppState ) => {
		if (
			isProductsListFetching( getState() ) ||
			( persist && type === getProductsListType( getState() ) )
		) {
			return;
		}

		dispatch( requestProductsList( { type, product_slugs: productSlugList, ...props } ) );
	};

export function useQueryProductsList( {
	type,
	currency,
	persist,
	productSlugList,
}: QueryProductsListProps = {} ) {
	const dispatch = useDispatch< CalypsoDispatch >();

	// Only runs on mount.
	useEffect( () => {
		dispatch( request( { type, currency, persist, productSlugList } ) );
	}, [ dispatch, type, persist, currency, productSlugList ] );
}

export default function QueryProductsList( {
	type,
	currency,
	persist,
	productSlugList,
}: QueryProductsListProps ) {
	useQueryProductsList( { type, currency, persist, productSlugList } );
	return null;
}
