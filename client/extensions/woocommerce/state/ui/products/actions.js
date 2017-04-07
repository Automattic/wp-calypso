/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_EXISTING_PRODUCT,
	WOOCOMMERCE_EDIT_NEW_PRODUCT,
	WOOCOMMERCE_EDIT_EXISTING_PRODUCT_VARIATION_TYPE,
	WOOCOMMERCE_EDIT_NEW_PRODUCT_VARIATION_TYPE,
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
