import { PaymentMethod, ExternalPaymentMethod } from '../types';

export function validateArg< V >(
	value: V,
	errorMessage: string
): asserts value is NonNullable< V > {
	if ( value === null || value === undefined ) {
		throw new Error( errorMessage );
	}
}

export function validateArgIfUndefined< V >(
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
	const { id, label, submitButton, getAriaLabel } = payment;
	validateArg( id, 'Invalid payment method; missing id property' );
	validateArg( label, `Invalid payment method '${ id }'; missing label` );
	validateArg( submitButton, `Invalid payment method '${ id }'; missing submitButton` );
	validateArg( getAriaLabel, `Invalid payment method '${ id }'; missing getAriaLabel` );
}
