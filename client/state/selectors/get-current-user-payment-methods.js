/**
 * External dependencies
 */
import { kebabCase, upperCase } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { getGeoCountryShort } from 'state/geo/selectors';

/**
 * Constants
 *
 * Payment methods can be targeted via a WP.com locale code (actually
 * a two letter lang usually) or by a full lang-CC locale.
 */
const DEFAULT_PAYMENT_METHODS = [ 'credit-card', 'paypal' ];

const paymentMethodsByLocale = {
	de: [ 'paypal', 'credit-card' ],
	'en-US': default_payment_methods,
};

/**
 * Returns the preferred payment methods for the current locale.
 *
 * @param  {Object}  state       Global state tree
 * @return {Array}               Preferred payment methods
 */
export default function getCurrentUserPaymentMethods( state ) {
	const countryCode = getGeoCountryShort( state );
	const locale = getCurrentUserLocale( state );
	const generatedLocale = kebabCase( locale ) + '-' + upperCase( countryCode );

	return paymentMethodsByLocale[ generatedLocale ] ||
		paymentMethodsByLocale[ locale ] ||
		[ ...DEFAULT_PAYMENT_METHODS ];
}
