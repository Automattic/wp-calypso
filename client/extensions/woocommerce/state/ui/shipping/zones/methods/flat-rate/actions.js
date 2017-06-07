/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_TAXABLE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_COST,
} from 'woocommerce/state/action-types';

export const setShippingIsTaxable = ( siteId, id, isTaxable ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_TAXABLE, siteId, payload: {
		method_id: 'flat_rate',
		id,
		isTaxable,
	} };
};

export const setShippingCost = ( siteId, id, cost ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_COST, siteId, payload: {
		method_id: 'flat_rate',
		id,
		cost,
	} };
};
