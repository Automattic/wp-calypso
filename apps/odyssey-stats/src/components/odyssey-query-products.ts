import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PRODUCTS_LIST_REQUEST, PRODUCTS_LIST_REQUEST_FAILURE } from 'calypso/state/action-types';
import { receiveProductsList } from 'calypso/state/products-list/actions';
import { isProductsListFetching } from 'calypso/state/products-list/selectors';

/**
 *
 * @param {Object} props 			The list of component props.
 * @param {string} [props.type] 	The type of products to request:
 *									"jetpack" for Jetpack products only, or undefined for all products.
 * @param {string} [props.currency] The currency code to override the currency used on the account.
 * @returns {null} 					No visible output.
 */
export default function QueryProductsList( {
	type = 'jetpack',
	currency,
}: {
	currency?: string;
	type?: string;
} ) {
	const isRequesting = useSelector( ( state: object ) => isProductsListFetching( state ) );
	const dispatch = useDispatch();

	// Only runs on mount.
	useEffect( () => {
		if ( isRequesting ) {
			return;
		}
		dispatch( { type: PRODUCTS_LIST_REQUEST } );
		// Calling the endpoint directly because jetpack/v4/products doesn't have tiers information (why?).
		globalThis
			.fetch(
				'https://public-api.wordpress.com/rest/v1.1/products?' +
					new URLSearchParams( { currency: currency ?? '', type } )
			)
			.then( ( response ) => response.json() )
			.then( ( productsList: Array< object > ) =>
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				dispatch( receiveProductsList( productsList, type ) )
			)
			.catch( ( error: Error ) =>
				dispatch( {
					type: PRODUCTS_LIST_REQUEST_FAILURE,
					error,
				} )
			);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ dispatch, type, currency ] );
	return null;
}
