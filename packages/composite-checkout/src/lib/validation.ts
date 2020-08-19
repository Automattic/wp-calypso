/**
 * Internal dependencies
 */
import { PaymentMethod, LineItem, LineItemAmount } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateArg( value: any, errorMessage: string ): void {
	if ( value === null || value === undefined ) {
		throw new Error( errorMessage );
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateArgIfUndefined( value: any, errorMessage: string ): void {
	if ( value === undefined ) {
		throw new Error( errorMessage );
	}
}

export function validatePaymentMethods( paymentMethods: PaymentMethod[] ): void {
	paymentMethods.map( validatePaymentMethod );
}

export function validatePaymentMethod( {
	id,
	label,
	submitButton,
	inactiveContent,
	getAriaLabel,
}: PaymentMethod ) {
	validateArg( id, 'Invalid payment method; missing id property' );
	validateArg( label, `Invalid payment method '${ id }'; missing label` );
	validateArg( submitButton, `Invalid payment method '${ id }'; missing submitButton` );
	validateArg( inactiveContent, `Invalid payment method '${ id }'; missing inactiveContent` );
	validateArg( getAriaLabel, `Invalid payment method '${ id }'; missing getAriaLabel` );
}

export function validateLineItems( items: LineItem[] ): void {
	items.map( validateLineItem );
}

export function validateTotal( { label, amount }: LineItem ): void {
	validateArg( label, `Invalid total; missing label property` );
	validateArg( amount, `Invalid total; missing amount property` );
	validateAmount( 'total', amount );
}

export function validateLineItem( { id, label, amount, type }: LineItem ): void {
	validateArg( id, 'Invalid line item; missing id property' );
	validateArg( label, `Invalid line item '${ id }'; missing label property` );
	validateArg( type, `Invalid line item '${ id }'; missing type property` );
	validateArg( amount, `Invalid line item '${ id }'; missing amount property` );
	validateAmount( id, amount );
}

export function validateAmount( id: string, { currency, value, displayValue }: LineItemAmount ) {
	validateArg( currency, `Invalid line item '${ id }'; missing amount.currency property` );
	validateArg( value, `Invalid line item '${ id }'; missing amount.value property` );
	validateArg( displayValue, `Invalid line item '${ id }'; missing amount.displayValue property` );
}
