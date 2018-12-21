/** @format */

/**
 * External dependencies
 */
import { get, has, isArray, isEmpty, isNumber, isString, map } from 'lodash';

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

/*
 * Adds tax_amount and tax_text fields to purchase object(s) if required.
 *
 * @param {Object[] | Object} purchase One or more purchase objects
 * @returns {Object[] | Object}
 */
export function maybeInjectTaxPlaceholdersIntoPurchases( purchase ) {
	if ( ! config.isEnabled( 'tax-placeholders' ) ) {
		return purchase;
	}

	if ( isArray( purchase ) ) {
		debug( 'injecting tax_amount into multiple purchases', purchase );
		return map( purchase, maybeInjectTaxPlaceholdersIntoPurchases );
	}

	const purchasePriceText = get( purchase, 'price_text' );
	const needsPriceText =
		! has( purchase, 'tax_text' ) &&
		isString( purchasePriceText ) &&
		! purchasePriceText.match( /include/i ); // skip if "Included with plan"

	const text = needsPriceText
		? { tax_text: purchasePriceText.replace( /(?<!\d|\.)(\d+)(\d)(?:\.(\d*)\d)?/, '$1.$2$3' ) }
		: {};

	const needsTaxAmount = ! has( purchase, 'tax_amount' ) && isNumber( get( purchase, 'amount' ) );
	const amount = needsTaxAmount ? { tax_amount: purchase.amount / 10 } : {};

	if ( isEmpty( amount ) && isEmpty( text ) ) {
		return purchase;
	}

	debug( 'injecting taxAmount into purchase', purchase );
	return Object.assign( {}, purchase, text, amount );
}
