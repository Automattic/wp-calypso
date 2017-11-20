/** @format */

/**
 * External dependencies
 */

import { lowerCase, upperCase } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { getGeoCountryShort } from 'state/geo/selectors';

/**
 * Constants
 *
 * Payment methods can be targeted via a full lang-CC locale, a two
 * digit GeoIP country code, or a WP.com "locale" code (more of a
 * two letter lang code really). Return value precedence is in that order.
 */
const DEFAULT_PAYMENT_METHODS = [ 'credit-card', 'paypal' ];

const paymentMethods = {
	byLocale: {},

	byCountry: {
		US: DEFAULT_PAYMENT_METHODS,
		NL: [ 'credit-card', 'ideal', 'paypal' ],
		DE: [ 'credit-card', 'giropay', 'paypal' ],
		BE: [ 'credit-card', 'bancontact', 'paypal' ],
	},

	byWpcomLang: {},
};

/**
 * Returns the preferred payment methods for the current locale.
 *
 * @param  {Object}  state       Global state tree
 * @return {Array}               Preferred payment methods
 */
export default function getCurrentUserPaymentMethods( state ) {
	const countryCode = getGeoCountryShort( state );
	const wpcomLang = getCurrentUserLocale( state );
	const generatedLocale = lowerCase( wpcomLang ) + '-' + upperCase( countryCode );

	return (
		paymentMethods.byLocale[ generatedLocale ] ||
		paymentMethods.byCountry[ countryCode ] ||
		paymentMethods.byWpcomLang[ wpcomLang ] || [ ...DEFAULT_PAYMENT_METHODS ]
	);
}
