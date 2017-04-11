/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT,
} from '../../action-types';

export function editProduct( product, data ) {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT,
		payload: { product, data },
	};
}

