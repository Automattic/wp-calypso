/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_EXISTING_PRODUCT_VARIATION_TYPE,
	WOOCOMMERCE_EDIT_NEW_PRODUCT_VARIATION_TYPE,
	WOOCOMMERCE_EDIT_PRODUCT,
} from '../../action-types';

export function editProduct( product, data ) {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT,
		payload: { product, data },
	};
}

export function editExistingProductVariationType( product, attributeIndex, data ) {
	return {
		type: WOOCOMMERCE_EDIT_EXISTING_PRODUCT_VARIATION_TYPE,
		payload: { product, attributeIndex, data },
	};
}

export function editNewProductVariationType( newProductIndex, product, attributeIndex, data ) {
	return {
		type: WOOCOMMERCE_EDIT_NEW_PRODUCT_VARIATION_TYPE,
		payload: { newProductIndex, product, attributeIndex, data },
	};
}