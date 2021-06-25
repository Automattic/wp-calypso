/**
 * Internal dependencies
 */
import {
	PaymentMethod,
	LineItem,
	LineItemAmount,
	ExternalPaymentMethod,
	ExternalLineItem,
	TotalValidatedLineItem,
	ExternalLineItemAmount,
} from '../types';

export function validateArg< V extends unknown >(
	value: V,
	errorMessage: string
): asserts value is NonNullable< V > {
	if ( value === null || value === undefined ) {
		throw new Error( errorMessage );
	}
}

export function validateArgIfUndefined< V extends unknown >(
	value: V,
	errorMessage: string
): asserts value is Exclude< V, undefined > {
	if ( value === undefined ) {
		throw new Error( errorMessage );
	}
}

export function validatePaymentMethods(
	paymentMethods: ExternalPaymentMethod[]
): asserts paymentMethods is PaymentMethod[] {
	paymentMethods.forEach( validatePaymentMethod );
}

export function validatePaymentMethod(
	payment: ExternalPaymentMethod
): asserts payment is PaymentMethod {
	const { id, label, submitButton, inactiveContent, getAriaLabel } = payment;
	validateArg( id, 'Invalid payment method; missing id property' );
	validateArg( label, `Invalid payment method '${ id }'; missing label` );
	validateArg( submitButton, `Invalid payment method '${ id }'; missing submitButton` );
	validateArg( inactiveContent, `Invalid payment method '${ id }'; missing inactiveContent` );
	validateArg( getAriaLabel, `Invalid payment method '${ id }'; missing getAriaLabel` );
}

export function validateLineItems( items: ExternalLineItem[] ): asserts items is LineItem[] {
	items.forEach( validateLineItem );
}

export function validateTotal( item: ExternalLineItem ): asserts item is TotalValidatedLineItem {
	const { label, amount } = item;
	validateArg( label, `Invalid total; missing label property` );
	validateArg( amount, `Invalid total; missing amount property` );
	validateAmount( 'total', amount );
}

export function validateLineItem( item: ExternalLineItem ): asserts item is LineItem {
	const { id, label, amount, type } = item;
	validateArg( id, 'Invalid line item; missing id property' );
	validateArg( label, `Invalid line item '${ id }'; missing label property` );
	validateArg( type, `Invalid line item '${ id }'; missing type property` );
	validateArg( amount, `Invalid line item '${ id }'; missing amount property` );
	validateAmount( id, amount );
}

export function validateAmount(
	id: string,
	item: ExternalLineItemAmount
): asserts item is LineItemAmount {
	const { currency, value, displayValue } = item;
	validateArg( currency, `Invalid line item '${ id }'; missing amount.currency property` );
	validateArg( value, `Invalid line item '${ id }'; missing amount.value property` );
	validateArg( displayValue, `Invalid line item '${ id }'; missing amount.displayValue property` );
}
