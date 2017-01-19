/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import sitesFactory from 'lib/sites-list';

const sites = sitesFactory();

export default {
	billingHistory( context ) {
		const BillingHistoryComponent = require( './main' );

		renderWithReduxStore(
			React.createElement( BillingHistoryComponent, { sites: sites } ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	transaction( context ) {
		const Receipt = require( './receipt' );
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
