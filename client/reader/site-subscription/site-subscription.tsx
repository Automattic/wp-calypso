import ReaderSiteSubscription from 'calypso/blocks/reader-site-subscription';
import Main from 'calypso/components/main';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import SiteSubscriptionProvider from './site-subscription-provider';

const SiteSubscription = ( { subscriptionId }: { subscriptionId: number } ) => {
	return (
		<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
			<SiteSubscriptionProvider subscriptionId={ subscriptionId }>
				<Main className="site-subscriptions-manager">
					<ReaderSiteSubscription />
				</Main>
			</SiteSubscriptionProvider>
		</SubscriptionManagerContextProvider>
	);
};

export default SiteSubscription;
