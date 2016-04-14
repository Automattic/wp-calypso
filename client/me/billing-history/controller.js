/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import i18n from 'lib/mixins/i18n';
import route from 'lib/route';
import titleActions from 'lib/screen-title/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import sitesFactory from 'lib/sites-list';

const ANALYTICS_PAGE_TITLE = 'Me';
const sites = sitesFactory();

export default {
	billingHistory( context ) {
		const BillingHistoryComponent = require( './main' );
		const billingData = require( 'lib/billing-history-data' );
		const basePath = route.sectionify( context.path );

		titleActions.setTitle( i18n.translate( 'Billing History', { textOnly: true } ) );

		renderWithReduxStore(
			React.createElement( BillingHistoryComponent, { billingData: billingData, sites: sites } ),
			document.getElementById( 'primary' ),
			context.store
		);

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Billing History' );
	},

	transaction( context ) {
		const ViewReceiptModal = require( './view-receipt-modal' );
		const billingData = require( 'lib/billing-history-data' );
		const transactionId = context.params.transaction_id;
		const basePath = route.sectionify( context.path );

		// Initialize billing data
		billingData.get();

		titleActions.setTitle( i18n.translate( 'Billing History', { textOnly: true } ) );

		if ( transactionId ) {
			analytics.pageView.record( basePath + '/receipt', ANALYTICS_PAGE_TITLE + ' > Billing History > Receipt' );

			renderWithReduxStore(
				React.createElement( ViewReceiptModal, { transaction: billingData.getTransaction( transactionId ) } ),
				document.getElementById( 'primary' ),
				context.store
			);
		}
	}
};
