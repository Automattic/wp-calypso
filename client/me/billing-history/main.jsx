/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'client/components/card';
import MeSidebarNavigation from 'client/me/sidebar-navigation';
import config from 'config';
import CreditCards from 'client/me/purchases/credit-cards';
import PurchasesHeader from '../purchases/purchases-list/header';
import BillingHistoryTable from './billing-history-table';
import UpcomingChargesTable from './upcoming-charges-table';
import SectionHeader from 'client/components/section-header';
import Main from 'client/components/main';
import DocumentHead from 'client/components/data/document-head';
import PageViewTracker from 'client/lib/analytics/page-view-tracker';
import QueryBillingTransactions from 'client/components/data/query-billing-transactions';
import purchasesPaths from 'client/me/purchases/paths';
import { getPastBillingTransactions, getUpcomingBillingTransactions } from 'client/state/selectors';

const BillingHistory = ( { pastTransactions, upcomingTransactions, translate } ) => (
	<Main className="billing-history">
		<DocumentHead title={ translate( 'Billing History' ) } />
		<PageViewTracker path="/me/purchases/billing" title="Me > Billing History" />
		<MeSidebarNavigation />
		<QueryBillingTransactions />
		<PurchasesHeader section={ 'billing' } />
		<Card className="billing-history__receipts">
			<BillingHistoryTable transactions={ pastTransactions } />
		</Card>
		<Card href={ purchasesPaths.purchasesRoot() }>
			{ translate( 'Go to "Purchases" to add or cancel a plan.' ) }
		</Card>
		{ pastTransactions && (
			<div>
				<SectionHeader label={ translate( 'Upcoming Charges' ) } />
				<Card className="billing-history__upcoming-charges">
					<UpcomingChargesTable transactions={ upcomingTransactions } />
				</Card>
			</div>
		) }
		{ config.isEnabled( 'upgrades/credit-cards' ) && <CreditCards /> }
	</Main>
);

export default connect( state => ( {
	pastTransactions: getPastBillingTransactions( state ),
	upcomingTransactions: getUpcomingBillingTransactions( state ),
} ) )( localize( BillingHistory ) );
