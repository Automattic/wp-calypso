/**
 * Internal dependencies
 */
import { post } from 'woocommerce/state/data-layer/request/actions';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import {
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
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

	dispatch( post( siteId, 'products/categories', categoryData, successAction, failureAction ) );
}

export default {
	[ WOOCOMMERCE_PRODUCT_CATEGORY_CREATE ]: [ handleProductCategoryCreate ],
};

