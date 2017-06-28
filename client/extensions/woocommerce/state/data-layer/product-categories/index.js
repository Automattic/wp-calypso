/**
 * Internal dependencies
 */
import { post } from 'woocommerce/state/data-layer/request/actions';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import { productCategoryUpdated } from 'woocommerce/state/sites/product-categories/actions';
import {
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
} from 'woocommerce/state/action-types';

export function handleProductCategoryCreate( { dispatch }, action ) {
	const { siteId, category, successAction, failureAction } = action;

	// Filter out any id we might have.
	const { id, ...categoryData } = category;

	if ( 'number' === typeof id ) {
		dispatch( setError( siteId, action, {
			message: 'Attempting to create a product category which already has a valid id.',
			category,
		} ) );
		return;
	}

	const updatedAction = productCategoryUpdated( siteId, null, successAction ); // data field will be filled in by request.
	dispatch( post( siteId, 'products/categories', categoryData, updatedAction, failureAction ) );
}

export function handleProductCategoryUpdated( { dispatch }, action ) {
	const { completionAction } = action;

	completionAction && dispatch( completionAction );
}

export default {
	[ WOOCOMMERCE_PRODUCT_CATEGORY_CREATE ]: [ handleProductCategoryCreate ],
	[ WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED ]: [ handleProductCategoryUpdated ],
};

