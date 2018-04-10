/** @format */

/**
 * External dependencies
 */
import { isEmpty, uniq } from 'lodash';

/**
 * Internal dependencies
 */
import { getGeoCountryShort } from 'state/geo/selectors';
import { getPaymentCountryCode } from 'state/selectors';

/**
 * Constants
 */
const countrySpecificPaymentMethods = {
	AT: [ 'eps' ],
	BE: [ 'bancontact' ],
	CN: [ 'alipay' ],
	DE: [ 'giropay' ],
	NL: [ 'ideal' ],
	PL: [ 'p24' ],
};

/**
 * Returns the preferred payment methods for the current user.
 *
 * @param  {Object}  state       Global state tree
 * @return {Array}               Preferred payment methods
 */
export default function getCurrentUserPaymentMethods( state ) {
	let paymentMethods = [ 'credit-card' ];

	// If the user is physically located in a particular country or has
	// selected that country as their payment country, include that country's
	// payment methods.
	const geoCountryPaymentMethods = countrySpecificPaymentMethods[ getGeoCountryShort( state ) ];
	if ( ! isEmpty( geoCountryPaymentMethods ) ) {
		paymentMethods = paymentMethods.concat( geoCountryPaymentMethods );
	}
	const paymentCountryPaymentMethods =
		countrySpecificPaymentMethods[ getPaymentCountryCode( state ) ];
	if ( ! isEmpty( paymentCountryPaymentMethods ) ) {
		paymentMethods = paymentMethods.concat( paymentCountryPaymentMethods );
	}

	paymentMethods.push( 'paypal' );

	return uniq( paymentMethods );
}
