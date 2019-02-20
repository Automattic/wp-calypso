/** @format */

import { parse as parseUrl } from 'url';
import { get, includes, mapValues, merge, pickBy } from 'lodash';
/**
 * Internal dependencies
 */
import config from 'config';
import { reduxGetState } from 'lib/redux-bridge';
import getPaymentCountryCode from 'state/selectors/get-payment-country-code';
import getPaymentPostalCode from 'state/selectors/get-payment-postal-code';

// #tax-on-checkout-placeholder
export function dummyTaxRate( postalCode, countryCode ) {
	if ( countryCode !== 'US' ) {
		return null;
	}

	return (
		get( getTaxQueryParams(), 'tax_rate' ) || Number( String( postalCode ).slice( -3 ) ) / 1000
	);
}

// Not really important, just avoids annoying react warnings
function coerceValues( v ) {
	if ( ! v ) {
		return v;
	}

	if ( ! isNaN( v ) ) {
		return Number( v );
	}

	return { true: true, false: false, '': false }[ v ] || v;
}

export function getQueryParams( keys ) {
	const params = get( parseUrl( window.location.href, true ), 'query' );
	const selectedValues = pickBy( params, ( _, key ) => includes( keys, key ) );
	return mapValues( selectedValues, coerceValues );
}

export function getLocationQueryParams() {
	return getQueryParams( [ 'postal_code', 'country_code' ] );
}

export function getTaxQueryParams() {
	return {
		...getQueryParams( [ 'tax_rate', 'display_taxes' ] ),
		location: getLocationQueryParams(),
	};
}

export function getCartQueryParams() {
	// We could add 'total_cost', 'sub_total', and/or 'total_tax', here if we
	// wanted to manipulate those values
	const cartParams = [ 'total_cost_display', 'sub_total_display', 'total_tax_display' ];
	return {
		...getQueryParams( cartParams ),
		tax: getTaxQueryParams(),
	};
}

export function injectCartWithPlaceholderTaxValues( cart ) {
	if ( ! config.isEnabled( 'show-tax' ) ) {
		return cart;
	}

	// #tax-on-checkout-placeholder
	const taxOnCheckoutPlaceholder = {
		sub_total: cart.total_cost,
		sub_total_display: cart.total_cost_display,
		total_tax: cart.total_cost,
		total_tax_display: cart.total_cost_display,
	};

	return merge( taxOnCheckoutPlaceholder, cart, getCartQueryParams() );
}

export function injectTaxStateWithPlaceholderValues( tax ) {
	if ( ! config.isEnabled( 'show-tax' ) ) {
		return tax;
	}

	const reduxState = reduxGetState();
	const placeholderTaxValues = reduxState
		? {
				location: {
					country_code: getPaymentCountryCode( reduxState ),
					postal_code: getPaymentPostalCode( reduxState ),
				},
		  }
		: {
				location: {
					country_code: 'US',
					postal_code: '90210',
				},
		  };

	// Overrides let us insert values for testing.
	const overrideValues = getTaxQueryParams();

	return merge( placeholderTaxValues, tax, overrideValues );
}
