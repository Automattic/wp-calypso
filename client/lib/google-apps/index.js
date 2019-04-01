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
		'https://accounts.google.com/AccountChooser?' +
		`Email=${ encodeURIComponent( email ) }` +
		`&service=CPanel` +
		`&continue=${ encodeURIComponent(
			`https://admin.google.com/${ domain }/AcceptTermsOfService?continue=https://mail.google.com/mail/u/${ email }`
		) }`
	);
}

export { getAnnualPrice, googleAppsSettingsUrl, formatPrice, getLoginUrlWithTOSRedirect };
