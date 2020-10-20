/**
 * External dependencies
 */

import React from 'react';
import PaymentMethodsComponent from './main';

export function paymentMethods( context, next ) {
	context.primary = React.createElement( PaymentMethodsComponent );
	next();
}
