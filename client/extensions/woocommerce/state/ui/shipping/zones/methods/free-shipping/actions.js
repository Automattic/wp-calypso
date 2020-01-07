/**
 * Internal dependencies
 */

import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_CONDITION,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_MIN_COST,
} from 'woocommerce/state/action-types';

/**
 * Changes the "requires" setting.
 * @param {number} siteId Site ID.
 * @param {string} methodId ID of the shipping method to edit.
 * @param {string} condition Condition that must be met to qualify for free shipping. See README.md for more details.
 * @returns {object} Action object.
 */
export const setFreeShippingCondition = ( siteId, methodId, condition ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_CONDITION,
		siteId,
		methodType: 'free_shipping',
		methodId,
		condition,
	};
};

/**
 * Changes the "min_amount" setting.
 * @param {number} siteId Site ID.
 * @param {string} methodId ID of the shipping method to edit.
 * @param {number} cost Minimum monetary amount for an order to qualify for free shipping.
 * @returns {object} Action object.
 */
export const setFreeShippingMinCost = ( siteId, methodId, cost ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_MIN_COST,
		siteId,
		methodType: 'free_shipping',
		methodId,
		cost,
	};
};
