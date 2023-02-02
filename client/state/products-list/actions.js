import { gql } from '@apollo/client';
import apollo from 'calypso/api/apollo';
// import wpcom from 'calypso/lib/wp';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { ensureNumericCost } from './assembler';

import 'calypso/state/currency-code/init';
import 'calypso/state/products-list/init';

export function receiveProductsList( productsList, type = null ) {
	// Since the request succeeded, productsList should be guaranteed non-null;
	// thus, we don't have any safety checks before this line.

	// Create a completely new products list to avoid mutating the original
	const sanitizedProductsList = Object.fromEntries(
		Object.entries( productsList ).map( ( [ slug, product ] ) => [
			slug,
			ensureNumericCost( product ),
		] )
	);

	return {
		type: PRODUCTS_LIST_RECEIVE,
		productsList: sanitizedProductsList,
		productsListType: type,
	};
}

const receiveGraphqlProducts = ( productsList, type = null ) => {
	const sanitizedProductsList = productsList.reduce( ( res, product ) => {
		res[ product.product_slug ] = product;
		return res;
	}, {} );
	return {
		type: PRODUCTS_LIST_RECEIVE,
		productsList: sanitizedProductsList,
		productsListType: type,
	};
};

/**
 * Requests the list of all products from the WPCOM API.
 *
 * @param   {Object} [query={}] A list of request parameters.
 * @param   {string} query.type The type of products to request (e.g., "jetpack");
 * 								or undefined, for all products
 * @returns {Function} 			an Action thunk
 */
export function requestProductsList( query = {} ) {
	return ( dispatch ) => {
		dispatch( { type: PRODUCTS_LIST_REQUEST } );

		return apollo
			.query( {
				query: gql`
					query GetProducts($type: String) {
						products(type: $type) {
							product_id
							product_name
							product_slug
							description
							product_type
							available
							billing_product_slug
							is_domain_registration
							cost_display
							combined_cost_display
							cost
							cost_smallest_unit
							currency_code
							price_tier_list {
								minimum_units
								maximum_units
								minimum_price
								maximum_price
								transform_quantity_divide_by
								transform_quantity_round
								flat_fee
								per_unit_fee
								minimum_price_display
								minimum_price_monthly_display
								maximum_price_display
								maximum_price_monthly_display
							}
							price_tier_usage_quantity
							product_term
							price_tier_slug
						}
					}
				`,
				variables: query,
			} )

			.then( ( productsList ) => {
				dispatch( receiveGraphqlProducts( productsList.data.products, query.type ) );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: PRODUCTS_LIST_REQUEST_FAILURE,
					error,
				} );
			} );

		// return wpcom.req
		// 	.get( '/products', query )
		// .then( ( productsList ) => dispatch( receiveProductsList( productsList, query.type ) ) )
		// 	.catch( ( error ) =>
		// 		dispatch( {
		// 			type: PRODUCTS_LIST_REQUEST_FAILURE,
		// 			error,
		// 		} )
		// 	);
	};
}
