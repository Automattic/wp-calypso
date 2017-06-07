/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_CONDITION,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_MIN_COST,
} from 'woocommerce/state/action-types';

export const setFreeShippingCondition = ( siteId, id, condition ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_CONDITION, siteId, payload: {
		method_id: 'free_shipping',
		id,
		condition, // requires: "", "coupon", "min_amount", "either", "both"
	} };
};

export const setFreeShippingMinCost = ( siteId, id, cost ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_MIN_COST, siteId, payload: {
		method_id: 'free_shipping',
		id,
		cost, // min_amount
	} };
};
