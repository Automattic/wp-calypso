export function validateArg( value, errorMessage ) {
	if ( value === null || value === undefined ) {
		throw new Error( errorMessage );
	}
}

export function validateArgIfUndefined( value, errorMessage ) {
	if ( value === undefined ) {
		throw new Error( errorMessage );
	}
}

export function validatePaymentMethods( paymentMethods ) {
	paymentMethods.map( validatePaymentMethod );
}

export function validatePaymentMethod( {
	id,
	label,
	submitButton,
	inactiveContent,
	getAriaLabel,
} ) {
	validateArg( id, 'Invalid payment method; missing id property' );
	validateArg( label, `Invalid payment method '${ id }'; missing label` );
	validateArg( submitButton, `Invalid payment method '${ id }'; missing submitButton` );
	validateArg( inactiveContent, `Invalid payment method '${ id }'; missing inactiveContent` );
	validateArg( getAriaLabel, `Invalid payment method '${ id }'; missing getAriaLabel` );
}

export function validateLineItems( items ) {
	items.map( validateLineItem );
}

export function validateTotal( { label, amount } ) {
	validateArg( label, `Invalid total; missing label property` );
	validateArg( amount, `Invalid total; missing amount property` );
	validateAmount( 'total', amount );
}

export function validateLineItem( { id, label, amount, type } ) {
	validateArg( id, 'Invalid line item; missing id property' );
	validateArg( label, `Invalid line item '${ id }'; missing label property` );
	validateArg( type, `Invalid line item '${ id }'; missing type property` );
	validateArg( amount, `Invalid line item '${ id }'; missing amount property` );
	validateAmount( id, amount );
}

export function validateAmount( id, { currency, value, displayValue } ) {
	validateArg( currency, `Invalid line item '${ id }'; missing amount.currency property` );
	validateArg( value, `Invalid line item '${ id }'; missing amount.value property` );
	validateArg( displayValue, `Invalid line item '${ id }'; missing amount.displayValue property` );
}

export function validateSteps( steps ) {
	steps.map( validateStep );
}

export function validateStep( { id } ) {
	validateArg( id, `Invalid step; missing id` );
}
