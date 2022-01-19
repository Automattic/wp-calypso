import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { isProductsListFetching, getProductsList } from 'calypso/state/products-list/selectors';

const request = ( props ) => ( dispatch, getState ) => {
	if (
		isProductsListFetching( getState() ) ||
		Object.keys( getProductsList( getState() ) ).length > 0
	) {
		return;
	}

	dispatch( requestProductsList( props ) );
};

/**
 *
 * @param {object} props 		The list of component props.
 * @param {string} [props.type] The type of products to request:
 * 								  "jetpack" for Jetpack products only, or undefined for all products.
 * @returns {null} 				No visible output.
 */
export default function QueryProductsList( { type } ) {
	const dispatch = useDispatch();

	// Only runs on mount.
	useEffect( () => {
		dispatch( request( { type } ) );
	}, [ dispatch, type ] );

	return null;
}
