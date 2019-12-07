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
	LabelComponent,
	SubmitButtonComponent,
	SummaryComponent,
	getAriaLabel,
} ) {
	validateArg( id, 'Invalid payment method; missing id property' );
	validateArg( LabelComponent, `Invalid payment method '${ id }'; missing LabelComponent` );
	validateArg(
		SubmitButtonComponent,
		`Invalid payment method '${ id }'; missing SubmitButtonComponent`
	);
	validateArg( SummaryComponent, `Invalid payment method '${ id }'; missing SummaryComponent` );
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
