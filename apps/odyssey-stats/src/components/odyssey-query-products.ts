import { useQuery } from '@tanstack/react-query';
import { isError } from 'lodash';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';
import { PRODUCTS_LIST_REQUEST, PRODUCTS_LIST_REQUEST_FAILURE } from 'calypso/state/action-types';
import { receiveProductsList } from 'calypso/state/products-list/actions';

function queryProductsList( currency = '', type = 'jetpack' ) {
	// Calling the endpoint directly because jetpack/v4/products doesn't have tiers information (why?).
	return globalThis
		.fetch(
			'https://public-api.wordpress.com/rest/v1.1/products?' +
				new URLSearchParams( { currency: currency ?? '', type } )
		)
		.then( ( response ) => response.json() )
		.catch( ( error: Error ) => error );
}
function useQueryProductsList( currency = '', type = 'jetpack' ) {
	return useQuery( {
		...getDefaultQueryParams(),
		queryKey: [ 'odyssey-stats', 'products', currency, type ],
		queryFn: () => queryProductsList( currency, type ),
		// If the module is not active, we don't want to retry the query.
		retry: false,
	} );
}

/**
 *
 * @param {Object} props 			The list of component props.
 * @param {string} [props.type] 	The type of products to request:
 *									"jetpack" for Jetpack products only, or undefined for all products.
 * @param {string} [props.currency] The currency code to override the currency used on the account.
 * @returns {null} 					No visible output.
 */
export default function OdysseyQueryProductsList( {
	type = 'jetpack',
	currency,
}: {
	currency?: string;
	type?: string;
} ) {
	const {
		isFetching,
		data: productsList,
		isError: hasOtherErrors,
	} = useQueryProductsList( currency, type );
	const dispatch = useDispatch();

	// Only runs on mount.
	useEffect( () => {
		if ( isFetching ) {
			return;
		}
		dispatch( { type: PRODUCTS_LIST_REQUEST } );
		if ( isError( productsList ) || hasOtherErrors ) {
			dispatch( {
				type: PRODUCTS_LIST_REQUEST_FAILURE,
				productsList,
			} );
		} else {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			dispatch( receiveProductsList( productsList, type ) );
		}
	}, [ dispatch, type, currency, productsList, hasOtherErrors, isFetching ] );

	return null;
}
