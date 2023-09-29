import ReaderSiteSubscription from 'calypso/blocks/reader-site-subscription';
import Main from 'calypso/components/main';
import SiteSubscriptionProvider from './site-subscription-provider';

const SiteSubscription = ( { subscriptionId }: { subscriptionId: number } ) => {
	return (
		<SiteSubscriptionProvider subscriptionId={ subscriptionId }>
			<Main className="site-subscriptions-manager">
				<ReaderSiteSubscription />
			</Main>
		</SiteSubscriptionProvider>
	);
};

export default SiteSubscription;
