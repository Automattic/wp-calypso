/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_TAXABLE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_COST,
} from 'woocommerce/state/action-types';

export const setShippingIsTaxable = ( siteId, methodId, isTaxable ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_TAXABLE,
		siteId,
		methodType: 'local_pickup',
		methodId,
		isTaxable, // "Taxable" / "None"
	};
};

export const setShippingCost = ( siteId, methodId, cost ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_COST,
		siteId,
		methodType: 'local_pickup',
		methodId,
		cost,
	};
};
