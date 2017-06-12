/**
 * External dependencies
 */
import { numberFormat } from 'i18n-calypso';

/**
 * Constants
 */
const GOOGLE_APPS_LINK_PREFIX = 'https://mail.google.com/a/';
const PRICE_FORMAT = /(\d+[.,]?\d+)/;

function getAnnualPrice( price ) {
	return price && price.replace( PRICE_FORMAT, ( value ) => {
		const number = parseFloat( value );
		return number % 1 === 0 ? number : numberFormat( number, 2 );
	} );
}

function getMonthlyPrice( price ) {
	return price && price.replace( PRICE_FORMAT, ( value ) => {
		const number = ( Math.round( parseFloat( value ) / 10 * 100 ) / 100 );
		return number % 1 === 0 ? number : numberFormat( number, 2 );
	} );
}

function googleAppsSettingsUrl( domainName ) {
	return GOOGLE_APPS_LINK_PREFIX + domainName;
}

export {
	getAnnualPrice,
	getMonthlyPrice,
	googleAppsSettingsUrl
};
