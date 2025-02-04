import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { isProductsListFetching, getProductsListType } from 'calypso/state/products-list/selectors';

const request =
	( { persist, ...props } ) =>
	( dispatch, getState ) => {
		if (
			isProductsListFetching( getState() ) ||
			( persist && props.type === getProductsListType( getState() ) )
		) {
			return;
		}

		dispatch( requestProductsList( props ) );
	};

export function useQueryProductsList( { type = 'all', currency, persist, productSlugList } = {} ) {
	const dispatch = useDispatch();

	// Only runs on mount.
	useEffect( () => {
		dispatch( request( { type, currency, persist, product_slugs: productSlugList } ) );
	}, [ dispatch, type, persist, currency, productSlugList ] );

	return null;
}

/**
 *
 * @param {Object} props 			The list of component props.
 * @param {string} [props.type] 	The type of products to request:
 *									"jetpack" for Jetpack products only, or undefined for all products.
 * @param {string} [props.currency] The currency code to override the currency used on the account.
 * @param {boolean} [props.persist] Set to true to persist the products list in the store.
 * @param {string[]} [props.productSlugList] Indicates the specific products being requested. Optional.
 * @returns {null} 					No visible output.
 */
export default function QueryProductsList( { type = 'all', currency, persist, productSlugList } ) {
	return useQueryProductsList( { type, currency, persist, productSlugList } );
}
