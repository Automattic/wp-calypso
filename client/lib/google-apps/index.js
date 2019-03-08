/**
 * External dependencies
 */
import formatCurrency from '@automattic/format-currency';

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

function getLoginUrlWithTOSRedirect( email, domain ) {
	return (
		`https://accounts.google.com/AccountChooser?Email=${ email }&service=CPanel` +
		`&continue=https%3A%2F%2Fadmin.google.com%2F${ domain }` +
		'%2FAcceptTermsOfService%3Fcontinue%3Dhttps%3A%2F%2Fmail.google.com%2Fmail%2Fu%2F1'
	);
}

export {
	getAnnualPrice,
	getMonthlyPrice,
	googleAppsSettingsUrl,
	formatPrice,
	getLoginUrlWithTOSRedirect,
};
