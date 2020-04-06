/**
 * External dependencies
 */

import React from 'react';
import BillingHistoryComponent from './main';
import UpcomingChargesComponent from './upcoming-charges';
import Receipt from './receipt';

export function billingHistory( context, next ) {
	context.primary = React.createElement( BillingHistoryComponent );
	next();
}

export function upcomingCharges( context, next ) {
	context.primary = React.createElement( UpcomingChargesComponent );
	next();
}

export function transaction( context, next ) {
	const receiptId = context.params.receiptId;

	if ( receiptId ) {
		context.primary = React.createElement( Receipt, { transactionId: receiptId } );
	}
	next();
}
