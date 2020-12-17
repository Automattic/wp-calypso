/**
 * External dependencies
 */

import React from 'react';
import PaymentMethodsComponent from 'calypso/me/purchases/payment-methods/main';

export function paymentMethods( context, next ) {
	context.primary = React.createElement( PaymentMethodsComponent );
	next();
}
