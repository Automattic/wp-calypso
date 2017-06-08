/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_CONDITION,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_MIN_COST,
} from 'woocommerce/state/action-types';

export const setFreeShippingCondition = ( siteId, methodId, condition ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_CONDITION,
		siteId,
		methodType: 'free_shipping',
		methodId,
		condition, // "", "coupon", "min_amount", "either", "both"
	};
};

export const setFreeShippingMinCost = ( siteId, methodId, cost ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_MIN_COST,
		siteId,
		methodType: 'free_shipping',
		methodId,
		cost,
	};
};
