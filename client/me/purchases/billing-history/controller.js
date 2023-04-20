import { createElement } from 'react';
import BillingHistoryComponent from 'calypso/me/purchases/billing-history/main';
import Receipt from './receipt';

export function billingHistory( context, next ) {
	context.primary = createElement( BillingHistoryComponent );
	next();
}

export function transaction( context, next ) {
	const receiptId = parseInt( context.params.receiptId, 10 );

	if ( receiptId ) {
		context.primary = createElement( Receipt, { transactionId: receiptId } );
	}
	next();
}
