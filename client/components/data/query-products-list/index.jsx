import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { isProductsListFetching, getProductsListType } from 'calypso/state/products-list/selectors';

const request = ( { persist, ...props } ) => ( dispatch, getState ) => {
	if ( persist && props.type === getProductsListType( getState() ) ) {
		return;
	}

	if ( isProductsListFetching( getState() ) ) {
		return;
	}

	dispatch( requestProductsList( props ) );
};

/**
 *
 * @param {object} props 			The list of component props.
 * @param {string} [props.type] 	The type of products to request:
 *									"jetpack" for Jetpack products only, or undefined for all products.
 * @param {boolean} [props.persist] Set to true to persist the products list in the store.
 * @returns {null} 					No visible output.
 */
export default function QueryProductsList( { type = 'all', persist } ) {
	const dispatch = useDispatch();

	// Only runs on mount.
	useEffect( () => {
		dispatch( request( { type, persist } ) );
	}, [ dispatch, type, persist ] );

	return null;
}
