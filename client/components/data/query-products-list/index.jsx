/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isProductsListFetching } from 'calypso/state/products-list/selectors';
import { requestProductsList } from 'calypso/state/products-list/actions';

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
