import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import AccountLevelAdvertisingLinks from './account-level-advertising-links';
import AccountLevelPurchaseLinks from './account-level-purchase-links';
import SubscriptionsContent from './subscriptions-content';

export default function Subscriptions() {
	return (
		<div className="subscriptions">
			<PageViewTracker path="/purchases/subscriptions" title="Subscriptions" />
			<SubscriptionsContent />
			{ ! isJetpackCloud() && <AccountLevelAdvertisingLinks /> }
			{ ! isJetpackCloud() && <AccountLevelPurchaseLinks /> }
		</div>
	);
}
