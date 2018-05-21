/** @format */

/**
 * External dependencies
 */

import React from 'react';
import BillingHistoryComponent from './main';
import Receipt from './receipt';

export function billingHistory( context, next ) {
	context.primary = React.createElement( BillingHistoryComponent );
	next();
}

export function transaction( context, next ) {
	const receiptId = context.params.receiptId;

	if ( receiptId ) {
		context.primary = React.createElement( Receipt, { transactionId: receiptId } );
	}
	next();
}
