import { createSelector } from '@automattic/state-utils';
import 'calypso/state/products-list/init';
import { getProductsList, ProductListItem } from './get-products-list';
import type { AppState } from 'calypso/types';

/**
 * Returns an array of products that matches the specified billing product slug.
 * @param state the state object
 * @param billingProductSlug the product slug to match
 * @returns ProductsListItem[]|undefined an array of products that matches the specified billing product slug or undefined if the products list is not loaded yet
 */
export const getProductsByBillingSlug = createSelector(
	( state: AppState, billingProductSlug: string ): ProductListItem[] | undefined => {
		if ( ! billingProductSlug ) {
			return undefined;
		}

		const products = getProductsList( state );

		if ( Object.keys( products ).length === 0 ) {
			return undefined;
		}
		return Object.values( products ).filter(
			( product ) => product.billing_product_slug === billingProductSlug
		);
	},
	( state ) => [ getProductsList( state ) ]
);
