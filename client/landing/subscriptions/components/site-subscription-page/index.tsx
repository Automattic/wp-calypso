import SiteSubscription from 'calypso/blocks/reader-site-subscription';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import { SiteSubscriptionProvider } from './site-subscription-provider';

export const SiteSubscriptionPage = () => (
	<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Subscriptions }>
		<SiteSubscriptionProvider>
			<SiteSubscription />
		</SiteSubscriptionProvider>
	</SubscriptionManagerContextProvider>
);
