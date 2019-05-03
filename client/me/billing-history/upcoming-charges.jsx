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
import Card from 'components/card';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PurchasesHeader from '../purchases/purchases-list/header';
import UpcomingChargesTable from './upcoming-charges-table';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryBillingTransactions from 'components/data/query-billing-transactions';
import getPastBillingTransactions from 'state/selectors/get-past-billing-transactions';

/**
 * Style dependencies
 */
import './style.scss';

const UpcomingCharges = ( { pastTransactions, translate } ) => (
	<Main>
		<DocumentHead title={ translate( 'Upcoming Charges' ) } />
		<PageViewTracker path="/me/purchases/upcoming" title="Me > Upcoming Charges" />
		<MeSidebarNavigation />
		<QueryBillingTransactions />
		<PurchasesHeader section={ 'upcoming' } />
		<Card className="billing-history__upcoming-charges">
			{ pastTransactions ? (
				<UpcomingChargesTable />
			) : (
				translate( "You don't have any upcoming charges." ) // This is a graceful fallback, in case someone guesses the URL
			) }
		</Card>
	</Main>
);

export default connect( state => ( {
	pastTransactions: getPastBillingTransactions( state ),
} ) )( localize( UpcomingCharges ) );
