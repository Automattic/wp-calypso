/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderPage } from 'lib/react-helpers';
import sitesFactory from 'lib/sites-list';

const sites = sitesFactory();

export default {
	billingHistory( context ) {
		const BillingHistoryComponent = require( './main' );

		renderPage(
			React.createElement( BillingHistoryComponent, { sites: sites } ),
			context
		);
	},

	transaction( context ) {
		const Receipt = require( './receipt' );
		const receiptId = context.params.receiptId;

		if ( receiptId ) {
			renderPage(
				React.createElement( Receipt, { transactionId: receiptId } ),
				context
			);
		}
	}
};
