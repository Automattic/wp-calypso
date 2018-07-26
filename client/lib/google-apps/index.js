/** @format */

/**
 * Internal dependencies
 */

import formatCurrency from 'lib/format-currency';

/**
 * Constants
 */
const GOOGLE_APPS_LINK_PREFIX = 'https://mail.google.com/a/';

function getAnnualPrice( cost, currencyCode ) {
	return formatPrice( cost, currencyCode );
}

function getMonthlyPrice( cost, currencyCode ) {
	return formatPrice( cost / 10, currencyCode );
}

function googleAppsSettingsUrl( domainName ) {
	return GOOGLE_APPS_LINK_PREFIX + domainName;
}

function formatPrice( cost, currencyCode, options = {} ) {
	if ( options.precision ) {
		const exponent = Math.pow( 10, options.precision );
		cost = Math.round( cost * exponent ) / exponent;
	}

	return formatCurrency( cost, currencyCode, cost % 1 > 0 ? {} : { precision: 0 } );
}

export { getAnnualPrice, getMonthlyPrice, googleAppsSettingsUrl, formatPrice };
