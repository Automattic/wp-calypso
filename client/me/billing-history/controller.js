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
		const billingData = require( 'lib/billing-history-data' );
		const basePath = route.sectionify( context.path );

		renderWithReduxStore(
			React.createElement( BillingHistoryComponent, { billingData: billingData, sites: sites } ),
			document.getElementById( 'primary' ),
			context.store
		);

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Billing History' );
	},

	transaction( context ) {
		const Receipt = require( './receipt' );
		const billingData = require( 'lib/billing-history-data' );
		const receiptId = context.params.receiptId;
		const basePath = route.sectionify( context.path );

		// Initialize billing data
		billingData.get();

		if ( receiptId ) {
			analytics.pageView.record( basePath + '/receipt', ANALYTICS_PAGE_TITLE + ' > Billing History > Receipt' );

			renderWithReduxStore(
				React.createElement( Receipt, { transaction: billingData.getTransaction( receiptId ) } ),
				document.getElementById( 'primary' ),
				context.store
			);
		}
	}
};
