import { useSelector } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import AccountLevelPurchaseLinks from './account-level-purchase-links';
import SubscriptionsContent from './subscriptions-content';

export default function Subscriptions() {
	const selectedSiteId = useSelector( getSelectedSiteId );

	return (
		<Main wideLayout className="subscriptions">
			<QuerySitePurchases siteId={ selectedSiteId } />
			<QueryStoredCards />
			<PageViewTracker path="/purchases/subscriptions" title="Subscriptions" />
			<SubscriptionsContent />
			<AccountLevelPurchaseLinks />
		</Main>
	);
}
