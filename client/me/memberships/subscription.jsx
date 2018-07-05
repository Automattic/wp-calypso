/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PurchasesHeader from '../purchases/purchases-list/header';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryMembershipsSubscriptions from 'components/data/query-memberships-subscriptions';
import formatCurrency from 'lib/format-currency';
import SectionHeader from 'components/section-header';

const Subscription = ( { translate, subscription, moment } ) => (
	<Main className="memberships__subscription">
		<DocumentHead title={ translate( 'My Memberships' ) } />
		<MeSidebarNavigation />
		<QueryMembershipsSubscriptions />
		<PurchasesHeader section={ 'memberships' } />
		<SectionHeader label={ translate( 'My Subscription' ) } />
		<Card className="memberships__receipts">{ 'potato' }</Card>
	</Main>
);

export default connect( state => ( {
	// subscription: get( state, 'memberships.subscriptions.items', [] ),
} ) )( localize( Subscription ) );
