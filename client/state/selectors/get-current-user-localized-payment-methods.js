/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { generateLangCcLocale } from 'state/i18n/util';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { getGeoCountryShort } from 'state/geo/selectors';

/**
 * Returns the preferred payment methods for the current locale.
 *
 * @param  {Object}  state       Global state tree
 * @return {Array}               Preferred payment methods
 */
export function getCurrentUserLocalizedPaymentMethods( state ) {
	const countryCode = getGeoCountryShort( state ),
		locale = getCurrentUserLocale( state ),
		generated_locale = generateLangCcLocale( locale, countryCode );

	let paymentMethods = get( state.i18n.locales, generated_locale + '.payments', false );

	if ( paymentMethods === false ) {
		paymentMethods = get( state.i18n.locales, locale + '.payments', false );
	}

	if ( paymentMethods === false ) {
		paymentMethods = get( state.i18n.locales, 'defaults.payments', null );
	}

	return paymentMethods;
}
