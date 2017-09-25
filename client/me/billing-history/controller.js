/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import BillingHistoryComponent from './main';
import Receipt from './receipt';
import { renderWithReduxStore } from 'lib/react-helpers';

export default {
	billingHistory( context ) {
	    renderWithReduxStore(
			React.createElement( BillingHistoryComponent ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	transaction( context ) {
	    const receiptId = context.params.receiptId;

		if ( receiptId ) {
			renderWithReduxStore(
				React.createElement( Receipt, { transactionId: receiptId } ),
				document.getElementById( 'primary' ),
				context.store
			);
		}
	}
};
