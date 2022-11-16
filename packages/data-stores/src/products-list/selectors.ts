import { select } from '@wordpress/data';
import { STORE_KEY } from './constants';
import { ProductsListItem } from './types';
import type { State } from './reducer';

export const getState = ( state: State ) => state;

export const getProductsList = ( state: State ) => {
	return state.productsList;
};

export const getProductBySlug = ( _state: State, slug: string ) => {
	if ( ! slug ) {
		return undefined;
	}
	const products = select( STORE_KEY ).getProductsList();

	if ( ! products ) {
		return undefined;
	}

	return products?.[ slug ];
};

/**
 * Returns an array of products that matches the specified billing product slug.
 *
 * @param _state the state object
 * @param billingProductSlug the product slug to match
 * @returns ProductsListItem[]|undefined an array of products that matches the specified billing product slug or undefined if the products list is not loaded yet
 */
export const getProductsByBillingSlug = (
	_state: State,
	billingProductSlug: string
): ProductsListItem[] | undefined => {
	if ( ! billingProductSlug ) {
		return undefined;
	}

	const products = select( STORE_KEY ).getProductsList();

	if ( ! products ) {
		return undefined;
	}
	return Object.values( products ).filter(
		( product ) => product.billing_product_slug === billingProductSlug
	);
};
