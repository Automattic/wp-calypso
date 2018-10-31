/** @format */

/**
 * Internal dependencies
 */
import config from 'config';
import createSelector from 'lib/create-selector';
import getPaymentCountryCode from 'state/selectors/get-payment-country-code';

/**
 * Returns true if tax is enabled for the current payment country
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       True if tax is enabled
 */
export default createSelector(
	state => {
		if ( ! config.isEnabled( 'show-tax' ) ) {
			return false;
		}

		const paymentCountryCode = getPaymentCountryCode( state );
		if ( paymentCountryCode ) {
			return paymentCountryCode === 'US';
		}

		return true;
	},
	[ getPaymentCountryCode ]
);
