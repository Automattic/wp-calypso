/**
 * External dependencies
 */
import { forEach, isEmpty, isFinite, omit, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrencyFormatDecimal, getCurrencyFormatString } from 'woocommerce/lib/currency';
import { getOrderStatusGroup } from 'woocommerce/lib/order-status';

export const DEFAULT_QUERY = {
	page: 1,
	per_page: 50,
	search: '',
	status: 'any',
};

/**
 * Returns a normalized orders query, excluding any values which match the
 * default order query.
 *
 * @param  {object} query Orders query
 * @returns {object}       Normalized orders query
 */
export function getNormalizedOrdersQuery( query ) {
	if ( query.status ) {
		query.status = getOrderStatusGroup( query.status );
	}
	return omitBy( query, ( value, key ) => DEFAULT_QUERY[ key ] === value );
}

/**
 * Returns a serialized orders query
 *
 * @param  {object} query  Orders query
 * @returns {string}        Serialized orders query
 */
export function getSerializedOrdersQuery( query = {} ) {
	const normalizedQuery = getNormalizedOrdersQuery( query );
	const serializedQuery = JSON.stringify( normalizedQuery );

	return serializedQuery;
}

/**
 * Remove temporary IDs used for adding products & fees to an existing order
 * The IDs for items needs to be null when sent to the API for the remote site
 * to correctly save them as new line items/fee items.
 *
 * @param  {object} order  Order object
 * @returns {object}        Order object, with no temporary IDs
 */
export function removeTemporaryIds( order ) {
	const newOrder = { ...order };
	for ( const type of [ 'line_items', 'fee_lines', 'coupon_lines', 'shipping_lines' ] ) {
		if ( order[ type ] ) {
			newOrder[ type ] = order[ type ].map( ( item ) => {
				if ( ! isFinite( item.id ) ) {
					return omit( item, 'id' );
				}
				return item;
			} );
		}
	}

	return newOrder;
}

/**
 * Convert all order values to the type expected by the API
 *
 * @param  {object} order  Order object
 * @returns {object}        Order object, with no temporary IDs
 */
export function transformOrderForApi( order ) {
	const totalsAndTaxes = [
		'cart_tax',
		'discount_total',
		'discount_tax',
		'shipping_total',
		'shipping_tax',
		'total',
		'total_tax',
	];
	forEach( totalsAndTaxes, ( key ) => {
		if ( isFinite( order[ key ] ) || order[ key ] ) {
			order[ key ] = getCurrencyFormatString( order[ key ], order.currency );
		}
	} );

	const transformOrderData = ( data, strings = [], prices = [], integers = [], floats = [] ) => {
		return data.map( ( line ) => {
			forEach( strings, ( key ) => {
				if ( isFinite( line[ key ] ) || line[ key ] ) {
					line[ key ] = line[ key ].toString();
				}
			} );
			forEach( prices, ( key ) => {
				if ( isFinite( line[ key ] ) || line[ key ] ) {
					line[ key ] = getCurrencyFormatString( line[ key ], order.currency );
				}
			} );
			forEach( integers, ( key ) => {
				if ( isFinite( line[ key ] ) || line[ key ] ) {
					line[ key ] = parseInt( line[ key ] );
				}
			} );
			forEach( floats, ( key ) => {
				if ( isFinite( line[ key ] ) || line[ key ] ) {
					line[ key ] = getCurrencyFormatDecimal( line[ key ], order.currency );
				}
			} );
			return line;
		} );
	};

	// line_items
	if ( ! isEmpty( order.line_items ) ) {
		order.line_items = transformOrderData(
			order.line_items,
			[ 'name', 'tax_class' ],
			[ 'subtotal', 'subtotal_tax', 'total', 'total_tax' ],
			[ 'product_id', 'variation_id', 'quantity' ],
			[ 'price' ]
		);
	}

	// shipping_lines
	if ( ! isEmpty( order.shipping_lines ) ) {
		order.shipping_lines = transformOrderData(
			order.shipping_lines,
			[ 'method_title', 'method_id' ],
			[ 'total', 'total_tax' ]
		);
	}

	// fee_lines
	if ( ! isEmpty( order.fee_lines ) ) {
		order.fee_lines = transformOrderData(
			order.fee_lines,
			[ 'name', 'tax_class', 'tax_status' ],
			[ 'total', 'total_tax' ]
		);
	}

	// coupon_lines
	if ( ! isEmpty( order.coupon_lines ) ) {
		order.coupon_lines = transformOrderData(
			order.coupon_lines,
			[ 'code' ],
			[ 'discount', 'discount_tax' ]
		);
	}

	//refunds
	if ( ! isEmpty( order.refunds ) ) {
		order.refunds = transformOrderData( order.refunds, [ 'reason' ], [ 'total' ] );
	}

	// Remove the email if it's set to an empty string (considered "invalid" on API).
	if ( order.billing && order.billing.email === '' ) {
		delete order.billing.email;
	}

	return order;
}
