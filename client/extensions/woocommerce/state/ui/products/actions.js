/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_EXISTING_PRODUCT,
	WOOCOMMERCE_EDIT_NEW_PRODUCT,
} from '../../action-types';

export function editExistingProduct( product, data ) {
	return {
		type: WOOCOMMERCE_EDIT_EXISTING_PRODUCT,
		payload: { product, data },
	};
}

export function editNewProduct( newProductIndex, product, data ) {
	return {
		type: WOOCOMMERCE_EDIT_NEW_PRODUCT,
		payload: { newProductIndex, product, data },
	};
}
