/** @format */

/**
 * External dependencies
 */

import { lowerCase, upperCase, includes } from 'lodash';

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
const SEPA_COUNTRIES = [
	'AT',
	'BE',
	'CY',
	'EE',
	'FI',
	'FR',
	'DE',
	'GR',
	'IE',
	'IT',
	'LV',
	'LT',
	'LU',
	'MT',
	'NL',
	'PT',
	'SK',
	'SI',
	'ES',
];

const paymentMethods = {
	byLocale: {},

	byCountry: {
		US: DEFAULT_PAYMENT_METHODS,
		AT: [ 'credit-card', 'eps', 'paypal' ],
		BE: [ 'credit-card', 'bancontact', 'paypal' ],
		CN: [ 'credit-card', 'alipay', 'paypal' ],
		DE: [ 'credit-card', 'giropay', 'paypal' ],
		NL: [ 'credit-card', 'ideal', 'paypal' ],
		PL: [ 'credit-card', 'p24', 'paypal' ],
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

	const userPaymentMethods = paymentMethods.byLocale[ generatedLocale ] ||
		paymentMethods.byCountry[ countryCode ] ||
		paymentMethods.byWpcomLang[ wpcomLang ] || [ ...DEFAULT_PAYMENT_METHODS ];

	// Inject sepa_debit into 2nd position for relevant countries
	if ( includes( SEPA_COUNTRIES, countryCode ) && ! includes( userPaymentMethods, 'sepa_debit' ) ) {
		userPaymentMethods.splice( 1, 0, 'sepa_debit' );
	}

	return userPaymentMethods;
}
