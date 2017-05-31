/**
 * External dependencies
 */
import moment from 'moment';

const createOrderObject = ( order ) => {
	if ( ! order ) {
		return {};
	}

	return {
		...order,
		line_items: ( order.line_items || [] ).map( line => ( {
			...line,
			priceText: '',
		} ) ),
		// Convert dates to moment objects
		date_created: order.date_created ? moment( order.date_created ) : null,
		date_modified: order.date_modified ? moment( order.date_modified ) : null,
		date_paid: order.date_paid ? moment( order.date_paid ) : null,
		date_completed: order.date_completed ? moment( order.date_completed ) : null,
		// Convert any values that should be a certain type
		prices_include_tax: Boolean( order.prices_include_tax ),
		// Format price using currency symbol
		// currency -> can we use this to format prices?
		totalPriceText: '', // @todo Add a formatted price
	};
};

export default createOrderObject;
