/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import Card from 'components/card';
import MeSidebarNavigation from 'me/sidebar-navigation';
import config from 'config';
import CreditCards from 'me/purchases/credit-cards';
import PurchasesHeader from '../purchases/purchases-list/header';
import BillingHistoryTable from './billing-history-table';
import UpcomingChargesTable from './upcoming-charges-table';
import SectionHeader from 'components/section-header';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryBillingTransactions from 'components/data/query-billing-transactions';
import purchasesPaths from 'me/purchases/paths';
import { getPastBillingTransactions, getUpcomingBillingTransactions } from 'state/selectors';

const BillingHistory = React.createClass( {
	mixins: [ observe( 'sites' ) ],

	render() {
		const { pastTransactions, upcomingTransactions, sites, translate } = this.props;

		return (
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
							<UpcomingChargesTable sites={ sites } transactions={ upcomingTransactions } />
						</Card>
					</div>
				}
				{ config.isEnabled( 'upgrades/credit-cards' ) &&
					<CreditCards />
				}
			</Main>
		);
	}
} );

export default connect(
	( state ) => ( {
		pastTransactions: getPastBillingTransactions( state ),
		upcomingTransactions: getUpcomingBillingTransactions( state ),
	} ),
)( localize( BillingHistory ) );
