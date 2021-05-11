/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SubscriptionsContent from './subscriptions-content';
import AccountLevelPurchaseLinks from './account-level-purchase-links';

export default function Subscriptions() {
	const selectedSiteId = useSelector( getSelectedSiteId );

	return (
		<Main wideLayout className="subscriptions">
			<QuerySitePurchases siteId={ selectedSiteId } />
			<PageViewTracker path="/purchases/subscriptions" title="Subscriptions" />
			<SubscriptionsContent />
			<AccountLevelPurchaseLinks />
		</Main>
	);
}
