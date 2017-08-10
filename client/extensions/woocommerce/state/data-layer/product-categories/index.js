/** @format */
/**
 * Internal dependencies
 */
import { dispatchWithProps } from 'woocommerce/state/helpers';
import { post } from 'woocommerce/state/data-layer/request/actions';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import { productCategoryUpdated } from 'woocommerce/state/sites/product-categories/actions';
import { WOOCOMMERCE_PRODUCT_CATEGORY_CREATE } from 'woocommerce/state/action-types';

export function handleProductCategoryCreate( store, action ) {
	const { siteId, category, successAction, failureAction } = action;

	// Filter out any id we might have.
	const { id, ...categoryData } = category;

	if ( 'number' === typeof id ) {
		store.dispatch(
			setError( siteId, action, {
				message: 'Attempting to create a product category which already has a valid id.',
				category,
			} )
		);
		return;
	}

	const updatedAction = ( dispatch, getState, { data } ) => {
		dispatch( productCategoryUpdated( siteId, data, action ) );

		const props = { sentData: action.category, receivedData: data };
		dispatchWithProps( dispatch, getState, successAction, props );
	};

	store.dispatch(
		post( siteId, 'products/categories', categoryData, updatedAction, failureAction )
	);
}

export default {
	[ WOOCOMMERCE_PRODUCT_CATEGORY_CREATE ]: [ handleProductCategoryCreate ],
};
