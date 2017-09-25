/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';

import BillingHistoryComponent from './main';
import Receipt from './receipt';

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
