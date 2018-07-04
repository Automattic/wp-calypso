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
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import getPastBillingTransactions from 'state/selectors/get-past-billing-transactions';
import QueryMembershipsSubscriptions from 'components/data/query-memberships-subscriptions';

const MembershipsHistory = ( { translate } ) => (
	<Main className="billing-history">
		<DocumentHead title={ translate( 'My Memberships' ) } />
		<PageViewTracker path="/me/purchases/memberships" title="Me > My Memberships" />
		<MeSidebarNavigation />
		<QueryMembershipsSubscriptions />
		<PurchasesHeader section={ 'memberships' } />
		<Card className="billing-history__receipts" />
	</Main>
);

export default connect( state => ( {
	pastTransactions: getPastBillingTransactions( state ),
} ) )( localize( MembershipsHistory ) );
