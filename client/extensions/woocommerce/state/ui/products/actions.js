/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCT_EDIT,
	WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT,
} from 'woocommerce/state/action-types';

export function editProduct( product, data ) {
	return {
		type: WOOCOMMERCE_PRODUCT_EDIT,
		payload: { product, data },
	};
}

export function editProductAttribute( product, attribute, data ) {
	return {
		type: WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT,
		payload: { product, attribute, data },
	};
}
