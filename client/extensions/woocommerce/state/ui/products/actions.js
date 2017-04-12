/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT,
	WOOCOMMERCE_EDIT_PRODUCT_ATTRIBUTE,
} from '../../action-types';

export function editProduct( product, data ) {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT,
		payload: { product, data },
	};
}

export function editProductAttribute( product, attributeIndex, data ) {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT_ATTRIBUTE,
		payload: { product, attributeIndex, data },
	};
}

