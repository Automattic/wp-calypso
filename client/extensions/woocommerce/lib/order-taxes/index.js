/**
 * External dependencies
 *
 * @format
 */

import { get, reduce } from 'lodash';

/**
 * Get the total tax for the discount value
 *
 * @param {Object} order An order as returned from API
 * @return {Float} Tax amount as a decimal number
 */
export function getOrderDiscountTax( order ) {
	const coupons = get( order, 'coupon_lines', [] );
	const tax = reduce( coupons, ( sum, value ) => sum + parseFloat( value.discount_tax ), 0 );
	return parseFloat( tax ) || 0;
}

/**
 * Get the total tax for a given line item's value
 *
 * @param {Object} order An order as returned from API
 * @param {Number} index The index of a line item in this order
 * @return {Float} Tax amount as a decimal number
 */
export function getOrderLineItemTax( order, index ) {
	const tax = get( order, `line_items[${ index }].taxes[0].total`, 0 );
	return parseFloat( tax ) || 0;
}

/**
 * Get the total tax for the shipping value
 *
 * @param {Object} order An order as returned from API
 * @return {Float} Tax amount as a decimal number
 */
export function getOrderShippingTax( order ) {
	const tax = get( order, 'shipping_lines[0].taxes[0].total', 0 );
	return parseFloat( tax ) || 0;
}

/**
 * Get the total tax for the subtotal value (total of all line items)
 *
 * @param {Object} order An order as returned from API
 * @return {Float} Tax amount as a decimal number
 */
export function getOrderSubtotalTax( order ) {
	const items = get( order, 'line_items', [] );
	return reduce( items, ( sum, value, key ) => sum + getOrderLineItemTax( order, key ), 0 );
}

/**
 * Get the total tax for the total value
 *
 * @param {Object} order An order as returned from API
 * @return {Float} Tax amount as a decimal number
 */
export function getOrderTotalTax( order ) {
	const subtotal = getOrderSubtotalTax( order );
	const shipping = getOrderShippingTax( order );
	return subtotal + shipping;
}
