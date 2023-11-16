import { SubscriptionManager } from '@automattic/data-stores';
import {
	SiteSubscriptionsList,
	SiteSubscriptionsListActionsBar,
} from 'calypso/landing/subscriptions/components/site-subscriptions-list';

const Sites = () => {
	return (
		<SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
			<SiteSubscriptionsListActionsBar />
			<SiteSubscriptionsList />
		</SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
	);
};

export default Sites;
