/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import route from 'lib/route';
import { renderWithReduxStore } from 'lib/react-helpers';
import sitesFactory from 'lib/sites-list';

const ANALYTICS_PAGE_TITLE = 'Me';
const sites = sitesFactory();

export default {
	billingHistory( context ) {
		const BillingHistoryComponent = require( './main' );
		const basePath = route.sectionify( context.path );

		renderWithReduxStore(
			React.createElement( BillingHistoryComponent, { sites: sites } ),
			document.getElementById( 'primary' ),
			context.store
		);

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Billing History' );
	},

	transaction( context ) {
		const Receipt = require( './receipt' );
		const receiptId = context.params.receiptId;
		const basePath = route.sectionify( context.path );

		if ( receiptId ) {
			analytics.pageView.record( basePath + '/receipt', ANALYTICS_PAGE_TITLE + ' > Billing History > Receipt' );

			renderWithReduxStore(
				React.createElement( Receipt, { transactionId: receiptId } ),
				document.getElementById( 'primary' ),
				context.store
			);
		}
	}
};
