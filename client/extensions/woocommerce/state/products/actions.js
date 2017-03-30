/**
 * Internal dependencies
 */
import { WOOCOMMERCE_EDIT_PRODUCT, WOOCOMMERCE_ADD_VARIATION } from '../action-types';

export function editProduct( id, key, value ) {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT,
		payload: { id, key, value },
	};
}

export function addVariation( id, variation ) {
	return {
		type: WOOCOMMERCE_ADD_VARIATION,
		payload: { id, variation },
	};
}
