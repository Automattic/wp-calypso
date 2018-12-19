/** @format */

/**
 * External dependencies
 */
import { get, has, isString, map } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
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

export function maybeInjectTaxPlaceholdersIntoPurchase( purchase ) {
	const purchasePriceText = get( purchase, 'price_text' );
	if (
		config.isEnabled( 'tax-placeholders' ) &&
		! has( purchase, 'tax_text' ) &&
		isString( purchasePriceText ) &&
		! purchasePriceText.match( /include/i ) // "Included with plan"
	) {
		debug( 'injecting taxAmount into purchase', purchase );
		return Object.assign( purchase, {
			tax_amount: purchase.amount / 10,
			tax_text: purchasePriceText.replace( /(?<!\d|\.)(\d+)(\d)(?:\.(\d*)\d)?/, '$1.$2$3' ),
		} );
	}
	return purchase;
}

export function maybeInjectTaxPlaceholdersIntoPurchases( purchases ) {
	if ( ! config.isEnabled( 'tax-placeholders' ) ) {
		return purchases;
	}
	debug( 'injecting tax_amount into purchases', purchases );
	return map( purchases, maybeInjectTaxPlaceholdersIntoPurchase );
}
