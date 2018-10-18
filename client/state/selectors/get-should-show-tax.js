/** @format */

/**
 * Internal dependencies
 */
import config from 'config';
import createSelector from 'lib/create-selector';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import getPaymentCountryCode from 'state/selectors/get-payment-country-code';

/**
 * Returns true if every site of the current user is a single user site
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       True if all sites are single user sites
 */
export default createSelector(
	state => {
		if ( config.isEnabled( 'show-tax-force' ) ) {
			return true;
		}

		if ( ! config.isEnabled( 'show-tax' ) ) {
			return false;
		}

		const paymentCountryCode = getPaymentCountryCode( state );
		if ( paymentCountryCode ) {
			// return paymentCountryCode === 'US';
		}

		// return getCurrentUserCountryCode( state ) === 'US';

		return true;
	},
	[ getPaymentCountryCode, getCurrentUserCountryCode ]
);
