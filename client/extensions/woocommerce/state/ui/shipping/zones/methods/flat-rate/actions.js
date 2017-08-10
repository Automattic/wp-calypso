/** @format */
/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_TAXABLE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_COST,
} from 'woocommerce/state/action-types';

/**
 * Changes the "tax_status" setting.
 * @param {Number} siteId Site ID.
 * @param {String} methodId ID of the shipping method to edit.
 * @param {Boolean} isTaxable Whether the shipping cost must be subject to taxes or not.
 * @return {Object} Action object.
 */
export const setShippingIsTaxable = ( siteId, methodId, isTaxable ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_TAXABLE,
		siteId,
		methodType: 'flat_rate',
		methodId,
		isTaxable,
	};
};

/**
 * Changes the "cost" setting.
 * @param {Number} siteId Site ID.
 * @param {String} methodId ID of the shipping method to edit.
 * @param {Number} cost Fixed cost the customer will pay for shipping.
 * @return {Object} Action object.
 */
export const setShippingCost = ( siteId, methodId, cost ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_COST,
		siteId,
		methodType: 'flat_rate',
		methodId,
		cost,
	};
};
