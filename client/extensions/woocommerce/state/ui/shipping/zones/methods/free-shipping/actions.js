/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_CONDITION,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_MIN_COST,
} from 'woocommerce/state/action-types';

export const setFreeShippingCondition = ( siteId, id, condition ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_CONDITION,
		siteId,
		methodType: 'free_shipping',
		id,
		condition, // "", "coupon", "min_amount", "either", "both"
	};
};

export const setFreeShippingMinCost = ( siteId, id, cost ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_MIN_COST,
		siteId,
		methodType: 'free_shipping',
		id,
		cost,
	};
};
