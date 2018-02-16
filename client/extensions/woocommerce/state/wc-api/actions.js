/** @format */

/**
 * Internal dependencies
 */
import { WOOCOMMERCE_WC_API_SET_UPDATE } from '../action-types';

export function setWcApiUpdate( updateRateMilliseconds ) {
	return {
		type: WOOCOMMERCE_WC_API_SET_UPDATE,
		updateRateMilliseconds,
	};
}
