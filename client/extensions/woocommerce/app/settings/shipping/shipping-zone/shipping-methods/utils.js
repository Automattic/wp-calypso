/**
 * External dependencies
 */
import { startsWith } from 'lodash';
import { translate } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */

export const getMethodSummary = ( method, currency ) => {
	if ( startsWith( method.methodType, 'wc_services' ) ) {
		return translate( 'Live rates calculated at checkout' );
	}

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
