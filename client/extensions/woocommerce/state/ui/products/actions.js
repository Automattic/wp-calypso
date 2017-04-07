/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT,
	WOOCOMMERCE_EDIT_VARIATION_TYPE,
	WOOCOMMERCE_EDIT_VARIATION,
} from '../../action-types';

export function editProduct( productId, data ) {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT,
		payload: { productId, data },
	};
}

export function editNewProduct( newProductIndex, data ) {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT,
		payload: { newProductIndex, data },
	};
}

export function editVariationType( productId, variationTypeIndex, data ) {
	return {
		type: WOOCOMMERCE_EDIT_VARIATION_TYPE,
		payload: { productId, variationTypeIndex, data },
	};
}

export function editNewProductVariationType( newProductIndex, variationTypeIndex, data ) {
	return {
		type: WOOCOMMERCE_EDIT_VARIATION_TYPE,
		payload: { newProductIndex, variationTypeIndex, data },
	};
}

