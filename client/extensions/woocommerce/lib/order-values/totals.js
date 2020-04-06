/**
 * External dependencies
 */
import { find, get, reduce } from 'lodash';

/**
 * Get the total for the discount value
 *
 * @param {object} order An order as returned from API
 * @returns {Float} Total amount as a decimal number
 */
export function getOrderDiscountTotal( order ) {
	const coupons = get( order, 'coupon_lines', [] );
	const total = reduce( coupons, ( sum, value ) => sum + parseFloat( value.discount ), 0 );
	return parseFloat( total ) || 0;
}

/**
 * Get the value for a single fee on a given order
 *
 * @param {object} order An order as returned from API
 * @param {number} id The ID of the fee_line
 * @returns {Float} The total fee amount as a decimal number
 */
export function getOrderFeeCost( order, id ) {
	const item = find( get( order, 'fee_lines', [] ), { id } );
	if ( item ) {
		return parseFloat( item.total ) || 0;
	}
	return 0;
}

/**
 * Get the fee total on a given order
 *
 * @param {object} order An order as returned from API
 * @returns {Float} The total fee amount as a decimal number
 */
export function getOrderFeeTotal( order ) {
	const fees = get( order, 'fee_lines', [] );
	return reduce( fees, ( sum, value ) => sum + parseFloat( value.total ), 0 );
}

/**
 * Get the individual price for a given item, pre-discounts.
 *
 * @param {object} order An order as returned from API
 * @param {number} id The ID of the line_item
 * @returns {Float} Total amount as a decimal number
 */
export function getOrderItemCost( order, id ) {
	const item = find( get( order, 'line_items', [] ), { id } );
	const subtotal = parseFloat( get( item, 'subtotal', 0 ) ) || 0;
	const qty = parseFloat( get( item, 'quantity', 1 ) ) || 1;
	return subtotal / qty;
}

/**
 * Get the refund value on a given order
 *
 * @param {object} order An order as returned from API
 * @returns {Float} The refund amount as a decimal number
 */
export function getOrderRefundTotal( order ) {
	const refunds = get( order, 'refunds', [] );
	return reduce( refunds, ( sum, value ) => sum + parseFloat( value.total ), 0 );
}

/**
 * Get the total for the shipping value
 *
 * @param {object} order An order as returned from API
 * @returns {Float} Total amount as a decimal number
 */
export function getOrderShippingTotal( order ) {
	const shipping = get( order, 'shipping_lines', [] );
	return reduce( shipping, ( sum, value ) => sum + parseFloat( value.total ), 0 );
}

/**
 * Get the total for the subtotal value (total of all line items)
 *
 * @param {object} order An order as returned from API
 * @returns {Float} Total amount as a decimal number
 */
export function getOrderSubtotal( order ) {
	const items = get( order, 'line_items', [] );
	return reduce( items, ( sum, value ) => sum + parseFloat( value.subtotal ), 0 );
}

/**
 * Get the total value on a given order
 *
 * @param {object} order An order as returned from API
 * @returns {Float} The total amount as a decimal number
 */
export function getOrderTotal( order ) {
	const discount = getOrderDiscountTotal( order );
	const fees = getOrderFeeTotal( order );
	const refunds = getOrderRefundTotal( order );
	const shipping = getOrderShippingTotal( order );
	const subtotal = getOrderSubtotal( order );
	// Refunds are negative, but discounts are not
	return subtotal - discount + fees + shipping + refunds;
}
