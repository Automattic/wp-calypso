/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PurchasesHeader from '../purchases/purchases-list/header';
import BillingHistoryTable from './billing-history-table';
import UpcomingChargesTable from './upcoming-charges-table';
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import QueryBillingTransactions from 'components/data/query-billing-transactions';
import Main from 'components/main';
import SectionHeader from 'components/section-header';
import config from 'config';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import CreditCards from 'me/purchases/credit-cards';
import purchasesPaths from 'me/purchases/paths';
import MeSidebarNavigation from 'me/sidebar-navigation';
import { getPastBillingTransactions, getUpcomingBillingTransactions } from 'state/selectors';

const BillingHistory = ( {
	pastTransactions,
	upcomingTransactions,
	translate
} ) => (
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
		{ pastTransactions &&
			<div>
				<SectionHeader label={ translate( 'Upcoming Charges' ) } />
				<Card className="billing-history__upcoming-charges">
					<UpcomingChargesTable transactions={ upcomingTransactions } />
				</Card>
			</div>
		}
		{ config.isEnabled( 'upgrades/credit-cards' ) &&
			<CreditCards />
		}
	</Main>
);

export default connect(
	( state ) => ( {
		pastTransactions: getPastBillingTransactions( state ),
		upcomingTransactions: getUpcomingBillingTransactions( state ),
	} ),
)( localize( BillingHistory ) );
