/** @format */

/**
 * External dependencies
 */
import { get, has, isString, map } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';

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
