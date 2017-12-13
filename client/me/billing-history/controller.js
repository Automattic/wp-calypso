/** @format */

/**
 * External dependencies
 */

import React from 'react';

export default {
	billingHistory( context, next ) {
		const BillingHistoryComponent = require( './main' );

		context.primary = React.createElement( BillingHistoryComponent );
		next();
	},

	transaction( context, next ) {
		const Receipt = require( './receipt' );
		const receiptId = context.params.receiptId;

		if ( receiptId ) {
			context.primary = React.createElement( Receipt, { transactionId: receiptId } );
		}
		next();
	},
};
