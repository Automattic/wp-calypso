/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCT_EDIT,
	WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT,
} from 'woocommerce/state/action-types';

export function editProduct( siteId, product, data ) {
	return {
		type: WOOCOMMERCE_PRODUCT_EDIT,
		siteId,
		product,
		data,
	};
}

export function editProductAttribute( siteId, product, attribute, data ) {
	return {
		type: WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT,
		siteId,
		product,
		attribute,
		data,
	};
}
