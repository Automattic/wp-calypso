/** @format */
/**
 * External dependencies
 */
import { omitBy, isNumber, omit } from 'lodash';

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
 * @param  {Object} query Orders query
 * @return {Object}       Normalized orders query
 */
export function getNormalizedOrdersQuery( query ) {
	return omitBy( query, ( value, key ) => DEFAULT_QUERY[ key ] === value );
}

/**
 * Returns a serialized orders query
 *
 * @param  {Object} query  Orders query
 * @return {String}        Serialized orders query
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
 * @param  {Object} order  Order object
 * @return {Object}        Order object, with no temporary IDs
 */
export function removeTemporaryIds( order ) {
	const newOrder = { ...order };
	for ( const type of [ 'line_items', 'fee_lines', 'coupon_lines', 'shipping_lines' ] ) {
		if ( order[ type ] ) {
			newOrder[ type ] = order[ type ].map( item => {
				if ( ! isNumber( item.id ) ) {
					return omit( item, 'id' );
				}
				return item;
			} );
		}
	}

	return newOrder;
}
