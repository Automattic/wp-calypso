/**
 * External dependencies
 */

import React from 'react';
import PendingPaymentsComponent from './index';

export function pendingPayments( context, next ) {
	context.primary = React.createElement( PendingPaymentsComponent );
	next();
}
