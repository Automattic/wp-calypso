/** @format */

/**
 * External dependencies
 */

import { lowerCase, upperCase } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { requestGeoLocation } from 'state/data-getters';

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
		AT: [ 'credit-card', 'eps', 'paypal' ],
		BE: [ 'credit-card', 'bancontact', 'paypal' ],
		BR: [ 'credit-card', 'brazil-tef', 'paypal' ],
		CN: [ 'credit-card', 'alipay', 'wechat', 'paypal' ],
		DE: [ 'credit-card', 'giropay', 'paypal' ],
		IN: [ 'credit-card', 'emergent-paywall', 'paypal' ],
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
	const countryCode = requestGeoLocation().data;
	const wpcomLang = getCurrentUserLocale( state );
	const generatedLocale = lowerCase( wpcomLang ) + '-' + upperCase( countryCode );

	return (
		paymentMethods.byLocale[ generatedLocale ] ||
		paymentMethods.byCountry[ countryCode ] ||
		paymentMethods.byWpcomLang[ wpcomLang ] || [ ...DEFAULT_PAYMENT_METHODS ]
	);
}
