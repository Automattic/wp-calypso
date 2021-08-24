import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { isProductsListFetching } from 'calypso/state/products-list/selectors';

const request = ( props ) => ( dispatch, getState ) => {
	if ( isProductsListFetching( getState() ) ) {
		return;
	}

	dispatch( requestProductsList( props ) );
};

/**
 *
 * @param {object} props 		The list of component props.
 * @param {string} [props.type] The type of products to request:
 * 								  "jetpack" for Jetpack products only, or undefined for all products.
 * @param {?string} [props.currency] The currency to return the product list in
 * @returns {null} 				No visible output.
 */
export default function QueryProductsList( { type, currency } ) {
	const dispatch = useDispatch();

	// Only runs on mount.
	useEffect( () => {
		dispatch( request( { type, currency } ) );
	}, [ dispatch, type, currency ] );

	return null;
}
