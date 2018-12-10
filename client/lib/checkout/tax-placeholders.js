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

export function maybeInjectTaxPlaceholdersIntoPurchase( purchase ) {
	const purchasePriceText = get( purchase, 'price_text' );
	if (
		config.isEnabled( 'show-tax' ) &&
		! has( purchase, 'taxAmount' ) &&
		isString( purchasePriceText ) &&
		! purchasePriceText.match( /include/i ) // "Included with plan"
	) {
		debug( 'injecting taxAmount into purchase', purchase );
		return Object.assign( purchase, {
			taxAmount: purchase.price_text.replace( /(\d+)(\d)\.(\d*)\d/, '$1.$2$3' ),
		} );
	}
	return purchase;
}

export function maybeInjectTaxPlaceholdersIntoPurchases( purchases ) {
	if ( ! config.isEnabled( 'show-tax' ) ) {
		return purchases;
	}
	debug( 'injecting tax_amount into purchases', purchases );
	return map( purchases, maybeInjectTaxPlaceholdersIntoPurchase );
}
