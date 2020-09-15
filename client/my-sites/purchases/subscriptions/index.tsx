/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PurchasesHeader from '../header';
import QueryUserPurchases from 'components/data/query-user-purchases';
import QueryConciergeInitial from 'components/data/query-concierge-initial';
import { getCurrentUserId } from 'state/current-user/selectors';
import SubscriptionsContent from './subscriptions-content';

export default function Subscriptions() {
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	return (
		<Main className="subscriptions">
			<QueryUserPurchases userId={ userId } />
			<PageViewTracker path="/purchases/subscriptions" title="Subscriptions" />
			<MeSidebarNavigation />
			<PurchasesHeader section="purchases" />
			<SubscriptionsContent />
			<QueryConciergeInitial />
		</Main>
	);
}
