/** @format */

import { parse as parseUrl } from 'url';
import { get, includes, isString, mapValues, merge, pickBy, map, has } from 'lodash';
/**
 * Internal dependencies
 */
import config from 'config';
import { reduxGetState } from 'lib/redux-bridge';
import getPaymentCountryCode from 'state/selectors/get-payment-country-code';
import getPaymentPostalCode from 'state/selectors/get-payment-postal-code';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:tax-placeholders' );

/*
 * The functions in this file are a temporary convenience to let us
 * write the front-end changes related to US sales tax before the actual
 * data is available from the backend.
 *
 * All of these functions should be inert without the `tax-placeholders`
 * configuration flag, and this flag should never be enable in production.
 *
 * This entire file should be removed after the backend changes are ready.
 *
 * See also https://github.com/Automattic/wp-calypso/projects/78
 */

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

export function injectSinglePurchaseWithPlaceholderValues( purchase ) {
	const purchasePriceText = get( purchase, 'price_text' );
	if ( ! config.isEnabled( 'show-tax' ) ) {
		return purchase;
	}

	// Ignore it if it's "Included with plan"
	// Note: this won't work in non-english, but it's only temporary anyway
	if ( isString( purchasePriceText ) && purchasePriceText.match( /include/i ) ) {
		return purchase;
	}
	debug( 'injecting taxAmount into purchase', purchase );

	// Let's reuse the property names from the cart
	const placeholderValues = getCartQueryParams();
	const cartPropertyNames = {
		tax_amount: 'total_tax',
		tax_text: 'total_tax_display',
	};
	return Object.assign(
		purchase,
		mapValues( cartPropertyNames, cartKey => placeholderValues[ cartKey ] || null )
	);
}

// Apply a function f to a single element, or map if over an array
const automap = f => arg => ( arg && typeof arg.map === 'function' ? arg.map( f ) : f( arg ) );

/**
 * Modifies a purchase or an array of purchases by injecting
 * @param  {purchase | [purchase]} purchases The purchase or purchases to be modified
 * @return {purchase | [purchase]}           Updated purchase(s)
 */
export const injectPurchasesWithPlaceholderValues = automap(
	injectSinglePurchaseWithPlaceholderValues
);

export function maybeInjectPlaceholderTaxAmountIntoCharge( charge ) {
	if (
		config.isEnabled( 'show-tax' ) &&
		! has( charge, 'tax_amount' ) &&
		isString( get( charge, 'amount' ) )
	) {
		return Object.assign( charge, {
			tax_amount: charge.amount.replace( /(\d+)(\d)\.(\d*)\d/, '$1.$2$3' ),
		} );
	}
	return charge;
}

export function maybeInjectPlaceholderTaxAmountIntoCharges( charges ) {
	return config.isEnabled( 'show-tax' )
		? map( charges, maybeInjectPlaceholderTaxAmountIntoCharge )
		: charges;
}
