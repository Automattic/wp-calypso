import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import AccountLevelAdvertisingLinks from './account-level-advertising-links';
import AccountLevelPurchaseLinks from './account-level-purchase-links';
import SubscriptionsContent from './subscriptions-content';

export default function Subscriptions() {
	const selectedSiteId = useSelector( getSelectedSiteId );

	return (
		<div className="subscriptions">
			<QuerySitePurchases siteId={ selectedSiteId } />
			<PageViewTracker path="/purchases/subscriptions" title="Subscriptions" />
			<SubscriptionsContent />
			{ ! isJetpackCloud() && <AccountLevelAdvertisingLinks /> }
			{ ! isJetpackCloud() && <AccountLevelPurchaseLinks /> }
		</div>
	);
}
