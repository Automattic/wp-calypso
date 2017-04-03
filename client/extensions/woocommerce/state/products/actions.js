/**
 * Internal dependencies
 */
import { WOOCOMMERCE_EDIT_PRODUCT } from '../action-types';

export function editProduct( id, key, value ) {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT,
		payload: { id, key, value },
	};
}
