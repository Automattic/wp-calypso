/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { ensureNumericCost } from './assembler';
import {
	doForCurrentCROIteration,
	Iterations,
} from 'calypso/my-sites/plans/jetpack-plans/iterations';

import 'calypso/state/currency-code/init';
import 'calypso/state/products-list/init';

export function receiveProductsList( productsList ) {
	// Since the request succeeded, productsList should be guaranteed non-null;
	// thus, we don't have any safety checks before this line.

	// Create a completely new products list to avoid mutating the original
	const sanitizedProductsList = Object.fromEntries(
		Object.entries( productsList ).map( ( [ slug, product ] ) => [
			slug,
			ensureNumericCost( product ),
		] )
	);

	// TODO: remove this once products are added to the Store.
	doForCurrentCROIteration( ( key ) => {
		if ( Iterations.ONLY_REALTIME_PRODUCTS === key ) {
			sanitizedProductsList.jetpack_backup = {
				product_id: 2112,
				available: true,
				cost: 100,
				cost_display: '$100.00',
				currency_code: 'USD',
				description: '',
				is_domain_registration: false,
				price_tier_list: [],
				price_tier_slug: '',
				price_tier_usage_quantity: null,
				price_tiers: [],
				product_name: 'Jetpack Backup',
				product_slug: 'jetpack_backup',
				product_type: 'jetpack',
			};
			sanitizedProductsList.jetpack_backup_monthly = {
				product_id: 2113,
				available: true,
				cost: 100,
				cost_display: '$100.00',
				currency_code: 'USD',
				description: '',
				is_domain_registration: false,
				price_tier_list: [],
				price_tier_slug: '',
				price_tier_usage_quantity: null,
				price_tiers: [],
				product_name: 'Jetpack Backup Monthly',
				product_slug: 'jetpack_backup_monthly',
				product_type: 'jetpack',
			};
			sanitizedProductsList.jetpack_backup_pro = {
				product_id: 2114,
				available: true,
				cost: 100,
				cost_display: '$100.00',
				currency_code: 'USD',
				description: '',
				is_domain_registration: false,
				price_tier_list: [],
				price_tier_slug: '',
				price_tier_usage_quantity: null,
				price_tiers: [],
				product_name: 'Jetpack Backup Pro',
				product_slug: 'jetpack_backup_pro',
				product_type: 'jetpack',
			};
			sanitizedProductsList.jetpack_backup_pro_monthly = {
				product_id: 2115,
				available: true,
				cost: 100,
				cost_display: '$100.00',
				currency_code: 'USD',
				description: '',
				is_domain_registration: false,
				price_tier_list: [],
				price_tier_slug: '',
				price_tier_usage_quantity: null,
				price_tiers: [],
				product_name: 'Jetpack Backup Pro Monthly',
				product_slug: 'jetpack_backup_pro_monthly',
				product_type: 'jetpack',
			};
			sanitizedProductsList.jetpack_security = {
				product_id: 2016,
				available: true,
				cost: 100,
				cost_display: '$100.00',
				currency_code: 'USD',
				description: '',
				is_domain_registration: false,
				price_tier_list: [],
				price_tier_slug: '',
				price_tier_usage_quantity: null,
				price_tiers: [],
				product_name: 'Jetpack Security',
				product_slug: 'jetpack_security',
				product_type: 'jetpack',
			};
			sanitizedProductsList.jetpack_security_monthly = {
				product_id: 2017,
				available: true,
				cost: 100,
				cost_display: '$100.00',
				currency_code: 'USD',
				description: '',
				is_domain_registration: false,
				price_tier_list: [],
				price_tier_slug: '',
				price_tier_usage_quantity: null,
				price_tiers: [],
				product_name: 'Jetpack Security Monthly',
				product_slug: 'jetpack_security_monthly',
				product_type: 'jetpack',
			};
			sanitizedProductsList.jetpack_security_pro = {
				product_id: 2018,
				available: true,
				cost: 100,
				cost_display: '$100.00',
				currency_code: 'USD',
				description: '',
				is_domain_registration: false,
				price_tier_list: [],
				price_tier_slug: '',
				price_tier_usage_quantity: null,
				price_tiers: [],
				product_name: 'Jetpack Security Pro',
				product_slug: 'jetpack_security_pro',
				product_type: 'jetpack',
			};
			sanitizedProductsList.jetpack_security_pro_monthly = {
				product_id: 2019,
				available: true,
				cost: 100,
				cost_display: '$100.00',
				currency_code: 'USD',
				description: '',
				is_domain_registration: false,
				price_tier_list: [],
				price_tier_slug: '',
				price_tier_usage_quantity: null,
				price_tiers: [],
				product_name: 'Jetpack Security Pro Monthly',
				product_slug: 'jetpack_security_pro_monthly',
				product_type: 'jetpack',
			};
		}
	} );

	return {
		type: PRODUCTS_LIST_RECEIVE,
		productsList: sanitizedProductsList,
	};
}

/**
 * Requests the list of all products from the WPCOM API.
 *
 * @param   {object} [query={}] A list of request parameters.
 * @param   {string} query.type The type of products to request (e.g., "jetpack");
 * 								or undefined, for all products
 * @returns {Function} 			an Action thunk
 */
export function requestProductsList( query = {} ) {
	return ( dispatch ) => {
		dispatch( { type: PRODUCTS_LIST_REQUEST } );

		return wpcom.req
			.get( '/products', query )
			.then( ( productsList ) => dispatch( receiveProductsList( productsList ) ) )
			.catch( ( error ) =>
				dispatch( {
					type: PRODUCTS_LIST_REQUEST_FAILURE,
					error,
				} )
			);
	};
}
