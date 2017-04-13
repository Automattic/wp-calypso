/**
 * Internal dependencies
 */
import {
	I18N_PAYMENT_METHODS_RECEIVE,
	I18N_PAYMENT_METHODS_REQUEST,
} from 'state/action-types';
import { generateLangCcLocale } from './util';

/**
 * Constants, poor man's near instant API request
 *
 * Payment methods can be targeted via a WP.com locale code (actually
 * a two letter lang usually) or by a full lang-CC locale.
 */
const default_payment_methods = [ 'credit-card', 'paypal' ];

const paymentMethodsByLocale = {
	"de": [ 'paypal', 'credit-card' ],
	"en-US": default_payment_methods,
};

/**
 * Returns an action object used to signal localized payment method
 * information has been received.
 *
 * @param  {Object} localizedPaymentMethods Localized payment method data
 * @return {Object}                         Action object
 */
export function receiveLocalizedPaymentMethods( localizedPaymentMethods ) {
	return {
		type: I18N_PAYMENT_METHODS_RECEIVE,
		localizedPaymentMethods
	};
}

/**
 * Returns a function which, when invoked, triggers a faux network request to fetch
 * localized payment method data.
 *
 * @param  {String}   lang         WP.com locale/lang code
 * @param  {String}   countryCode  GeoIP county code
 * @return {Function}              Action thunk
 */
export function requestLocalizedPaymentMethods( lang, countryCode ) {
	const generated_locale = generateLangCcLocale( lang, countryCode ),
		fauxApiResponse = { defaults: { payments: default_payment_methods } };

	if ( paymentMethodsByLocale[ generated_locale ] ) {
		fauxApiResponse[ generated_locale ] = { payments: paymentMethodsByLocale[ generated_locale ] };
	}

	if ( paymentMethodsByLocale[ lang ] ) {
		fauxApiResponse[ lang ] = { payments: paymentMethodsByLocale[ lang ] };
	}

	return ( dispatch ) => {
		dispatch( { type: I18N_PAYMENT_METHODS_REQUEST } );
		return dispatch( receiveLocalizedPaymentMethods( fauxApiResponse ) );
	};
}
