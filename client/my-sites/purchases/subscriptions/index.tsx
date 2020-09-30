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
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getSelectedSiteId } from 'state/ui/selectors';
import SubscriptionsContent from './subscriptions-content';
import AccountLevelPurchaseLinks from './account-level-purchase-links';
import SectionHeader from 'components/section-header';

export default function Subscriptions() {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const translate = useTranslate();

	return (
		<Main className="subscriptions is-wide-layout">
			<QuerySitePurchases siteId={ selectedSiteId } />
			<PageViewTracker path="/purchases/subscriptions" title="Subscriptions" />
			<MySitesSidebarNavigation />
			<SectionHeader label={ translate( 'Subscriptions' ) } />
			<SubscriptionsContent />
			<AccountLevelPurchaseLinks />
		</Main>
	);
}
