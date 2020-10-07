/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getSelectedSiteId } from 'state/ui/selectors';
import SubscriptionsContent from './subscriptions-content';
import AccountLevelPurchaseLinks from './account-level-purchase-links';

export default function Subscriptions() {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );

	return (
		<Main className="subscriptions is-wide-layout">
			<QuerySitePurchases siteId={ selectedSiteId } />
			<PageViewTracker path="/purchases/subscriptions" title="Subscriptions" />
			<SubscriptionsContent />
			<AccountLevelPurchaseLinks />
		</Main>
	);
}
