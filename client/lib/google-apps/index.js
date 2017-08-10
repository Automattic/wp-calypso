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
	return formatCurrency( cost, currencyCode );
}

function getMonthlyPrice( cost, currencyCode ) {
	return formatCurrency( cost / 10, currencyCode );
}

function googleAppsSettingsUrl( domainName ) {
	return GOOGLE_APPS_LINK_PREFIX + domainName;
}

export { getAnnualPrice, getMonthlyPrice, googleAppsSettingsUrl };
