/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';

export const getMethodSummary = ( method, currency ) => {
	switch ( method.methodType ) {
		case 'free_shipping':
			if ( ! method.requires ) {
				return translate( 'Free for everyone' );
			}

			return translate( 'Minimum order amount: %s', {
				args: [ formatCurrency( method.min_amount, currency ) || method.min_amount ],
			} );
		case 'flat_rate':
		case 'local_pickup':
			return formatCurrency( method.cost, currency ) || method.cost;
		default:
			return '';
	}
};
