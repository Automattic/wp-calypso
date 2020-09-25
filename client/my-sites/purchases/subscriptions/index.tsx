/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import MySitesSidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryUserPurchases from 'components/data/query-user-purchases';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getCurrentUserId } from 'state/current-user/selectors';
import SubscriptionsContent from './subscriptions-content';
import AccountLevelPurchaseLinks from './account-level-purchase-links';
import SiteLevelPurchaseLinks from './site-level-purchase-links';
import SectionHeader from 'components/section-header';

export function Subscriptions() {
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const translate = useTranslate();

	return (
		<Main className="subscriptions is-wide-layout">
			<QueryUserPurchases userId={ userId } />
			<PageViewTracker path="/purchases/subscriptions" title="Subscriptions" />
			<MySitesSidebarNavigation />
			<SectionHeader label={ translate( 'Subscriptions' ) } />
			<SubscriptionsContent />
			<AccountLevelPurchaseLinks />
		</Main>
	);
}

export function SiteSubscriptions( { siteId } ) {
	const translate = useTranslate();

	return (
		<Main className="subscriptions is-wide-layout">
			<QuerySitePurchases siteId={ siteId } />
			<PageViewTracker path="/purchases/subscriptions" title="Subscriptions" />
			<MySitesSidebarNavigation />
			<SectionHeader label={ translate( 'Subscriptions' ) } />
			<SubscriptionsContent />
			<SiteLevelPurchaseLinks />
		</Main>
	);
}
