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
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryUserPurchases from 'components/data/query-user-purchases';
import { getCurrentUserId } from 'state/current-user/selectors';
import SubscriptionsContent from './subscriptions-content';
import AccountLevelPurchaseLinks from './account-level-purchase-links';
import SectionHeader from 'components/section-header';

export default function Subscriptions() {
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const translate = useTranslate();

	return (
		<Main className="subscriptions is-wide-layout">
			<QueryUserPurchases userId={ userId } />
			<PageViewTracker path="/purchases/subscriptions" title="Subscriptions" />
			<SectionHeader label={ translate( 'Subscriptions' ) } />
			<SubscriptionsContent />
			<AccountLevelPurchaseLinks />
		</Main>
	);
}
