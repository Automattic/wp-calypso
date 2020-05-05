/**
 * External dependencies
 */
import { find, get, reduce } from 'lodash';

/**
 * Get the total tax for the discount value
 *
 * @param {object} order An order as returned from API
 * @returns {Float} Tax amount as a decimal number
 */
export function getOrderDiscountTax( order ) {
	const coupons = get( order, 'coupon_lines', [] );
	const tax = reduce( coupons, ( sum, value ) => sum + parseFloat( value.discount_tax ), 0 );
	return parseFloat( tax ) || 0;
}

/**
 * Get the total tax for a given line item's value
 *
 * @param {object} order An order as returned from API
 * @param {number} id The ID of the line_item
 * @returns {Float} Tax amount as a decimal number
 */
export function getOrderLineItemTax( order, id ) {
	const items = get( order, 'line_items', [] );
	const tax = get( find( items, { id } ), 'taxes[0].total', 0 );
	return parseFloat( tax ) || 0;
}

/**
 * Get the total tax for a given fee
 *
 * @param {object} order An order as returned from API
 * @param {number} id The ID of a fee line in this order
 * @returns {Float} Tax amount as a decimal number
 */
export function getOrderFeeTax( order, id ) {
	const items = get( order, 'fee_lines', [] );
	const tax = get( find( items, { id } ), 'taxes[0].total', 0 );
	return parseFloat( tax ) || 0;
}

/**
 * Get the total tax for all fees in an order (total of all fee lines)
 *
 * @param {object} order An order as returned from API
 * @returns {Float} Tax amount as a decimal number
 */
export function getOrderFeeTotalTax( order ) {
	const lines = get( order, 'fee_lines', [] );
	return reduce( lines, ( sum, value ) => sum + getOrderFeeTax( order, value.id ), 0 );
}

/**
 * Get the method title for the shipping value
 *
 * @param {object} order An order as returned from API
 * @returns {string} Shipping method title
 */
export function getOrderShippingMethod( order ) {
	return get( order, 'shipping_lines[0].method_title', false );
}

/**
 * Get the total tax for the shipping value
 *
 * @param {object} order An order as returned from API
 * @returns {Float} Tax amount as a decimal number
 */
export function getOrderShippingTax( order ) {
	const tax = get( order, 'shipping_lines[0].taxes[0].total', 0 );
	return parseFloat( tax ) || 0;
}

/**
 * Get the total tax for the subtotal value (total of all line items)
 *
 * @param {object} order An order as returned from API
 * @returns {Float} Tax amount as a decimal number
 */
export function getOrderSubtotalTax( order ) {
	const items = get( order, 'line_items', [] );
	return reduce( items, ( sum, value ) => sum + getOrderLineItemTax( order, value.id ), 0 );
}

/**
 * Get the total tax for the total value
 *
 * @param {object} order An order as returned from API
 * @returns {Float} Tax amount as a decimal number
 */
export function getOrderTotalTax( order ) {
	const subtotal = getOrderSubtotalTax( order );
	const shipping = getOrderShippingTax( order );
	const fees = getOrderFeeTotalTax( order );
	return subtotal + shipping + fees;
}
