import { createElement } from 'react';
import PendingPaymentsComponent from './index';

export function pendingPayments( context, next ) {
	context.primary = createElement( PendingPaymentsComponent );
	next();
}
